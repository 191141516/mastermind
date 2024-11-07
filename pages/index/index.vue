<template>
	<view class="content">
		<view class="puzzle-card">
			<view class="lock-section">
				<image class="lock-image" src="/static/lock.png"></image>
				<view class="password-boxes">
					<view v-for="(digit, index) in currentPuzzle.userInput" 
						  :key="index"
						  class="password-box">
						<text>?</text>
					</view>
				</view>
			</view>
			
			<view class="input-section">
				<view class="hint-list">
					<view v-for="(hint, index) in visibleHints" 
						  :key="index" 
						  class="hint-row">
						<view class="number-group">
							<view v-for="(num, nIndex) in hint.code.split('')" 
								  :key="nIndex" 
								  class="number-box">
								{{num}}
							</view>
						</view>
						<text class="hint-message">{{hint.message}}</text>
					</view>
				</view>
				
				<view class="keypad">
					<view class="keypad-row" v-for="row in keypadNumbers" :key="row[0]">
						<view v-for="num in row" 
							  :key="num"
							  class="keypad-button"
							  @tap="inputNumber(num)">
							{{num}}
						</view>
					</view>
					<view class="keypad-row">
						<view class="keypad-button" @tap="deleteNumber">←</view>
						<view class="keypad-button">0</view>
						<view class="keypad-button confirm" @tap="checkPassword">确认</view>
					</view>
				</view>
			</view>
			
			<view class="action-buttons" v-if="hasHiddenHints">
				<button @tap="showHint" class="hint-btn">
					<text>获取提示</text>
					<text class="cost">{{hintCount > 0 ? '免费' : '看广告'}}</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import puzzleGenerator from '@/utils/puzzleGenerator.js'

export default {
	data() {
		return {
			currentLevel: 1,
			coins: 0,
			hintCount: 3,
			keypadNumbers: [
				['1', '2', '3'],
				['4', '5', '6'],
				['7', '8', '9']
			],
			currentInputIndex: 0,
			levels: []
		}
	},
	onLoad() {
		this.initializeLevels()
	},
	computed: {
		currentPuzzle() {
			return this.levels[this.currentLevel - 1]
		},
		visibleHints() {
			return this.currentPuzzle.hints.filter(hint => !hint.isLocked)
		},
		hasHiddenHints() {
			return this.currentPuzzle.hints.some(hint => hint.isLocked)
		}
	},
	methods: {
		initializeLevels() {
			// 初始生成前3关
			for(let i = 1; i <= 3; i++) {
				const puzzle = puzzleGenerator.generatePuzzle({
					level: i,
					digitCount: 3,
					hintCount: 5
				})
				this.levels.push(puzzle)
			}
		},
		
		inputNumber(num) {
			if (this.currentInputIndex < 3) {
				this.currentPuzzle.userInput[this.currentInputIndex] = num
				this.currentInputIndex++
			}
		},
		deleteNumber() {
			if (this.currentInputIndex > 0) {
				this.currentInputIndex--
				this.currentPuzzle.userInput[this.currentInputIndex] = ''
			}
		},
		checkPassword() {
			const input = this.currentPuzzle.userInput.join('')
			
			if(input === this.currentPuzzle.answer) {
				this.handleLevelComplete()
			} else {
				uni.showToast({
					title: '密码错误',
					icon: 'error'
				})
			}
		},
		
		handleLevelComplete() {
			const reward = 100 + (this.currentLevel * 50)
			this.coins += reward
			
			// 提前生成下一关
			const nextLevel = this.currentLevel + 1
			if(nextLevel > this.levels.length) {
				const puzzle = puzzleGenerator.generatePuzzle({
					level: nextLevel,
					digitCount: 3,
					hintCount: 5
				})
				this.levels.push(puzzle)
			}
			
			uni.showModal({
				title: '恭喜通关！',
				content: `获得${reward}金币！继续下一关？`,
				success: (res) => {
					if(res.confirm) {
						this.currentLevel++
						this.currentInputIndex = 0 // 重置输入位置
					}
				}
			})
		},
		
		handleGameComplete() {
			uni.showModal({
				title: '恭喜！',
				content: '你已完成所有关卡！',
				showCancel: false
			})
		},
		
		showHint() {
			if(this.hintCount <= 0 && this.coins < 50) {
				uni.showModal({
					title: '提示',
					content: '观看广告获取提示机会？',
					success: (res) => {
						if(res.confirm) {
							this.showAd()
						}
					}
				})
			} else if(this.coins >= 50) {
				uni.showModal({
					title: '提示',
					content: '使用50金币购买提示？',
					success: (res) => {
						if(res.confirm) {
							this.coins -= 50
							this.unlockHint()
						}
					}
				})
			}
		},
		
		showAd() {
			// 这里接入广告SDK
			console.log('显示广告')
			// 广告播放完成后
			this.hintCount++
			this.unlockHint()
		},
		
		unlockHint() {
			const lockedHint = this.currentPuzzle.hints.find(hint => hint.isLocked)
			if(lockedHint) {
				lockedHint.isLocked = false
			}
		}
	}
}
</script>

<style>
.content {
	min-height: 100vh;
	background-color: #f8f4f0;
	padding: 30rpx;
}

.puzzle-card {
	background-color: white;
	border-radius: 20rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.lock-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
}

.lock-image {
	width: 240rpx;
	height: 240rpx;
	margin-bottom: 30rpx;
}

.password-boxes {
	display: flex;
	gap: 20rpx;
}

.password-box {
	width: 100rpx;
	height: 100rpx;
	border: 4rpx solid #333;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
	font-weight: bold;
}

.hint-list {
	margin-bottom: 40rpx;
}

.hint-row {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #eee;
}

.number-group {
	display: flex;
	gap: 10rpx;
	margin-right: 30rpx;
}

.number-box {
	width: 80rpx;
	height: 80rpx;
	border: 2rpx solid #666;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	font-weight: bold;
}

.hint-message {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.keypad {
	margin-top: 40rpx;
}

.keypad-row {
	display: flex;
	justify-content: center;
	gap: 20rpx;
	margin-bottom: 20rpx;
}

.keypad-button {
	width: 120rpx;
	height: 120rpx;
	background-color: #f5f5f5;
	border-radius: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	font-weight: bold;
	box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.keypad-button.confirm {
	background-color: #007AFF;
	color: white;
	font-size: 32rpx;
}

.action-buttons {
	margin-top: 40rpx;
	display: flex;
	justify-content: center;
}

.hint-btn {
	background-color: #FF9500;
	color: white;
	border-radius: 40rpx;
	padding: 20rpx 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	border: none;
}

.hint-btn .cost {
	font-size: 24rpx;
	opacity: 0.8;
	margin-top: 4rpx;
}

/* 锁定提示的样式 */
.hint-row.locked {
	opacity: 0.5;
}

/* 输入框激活状态 */
.password-box.active {
	border-color: #007AFF;
	background-color: #f0f7ff;
}
</style>
