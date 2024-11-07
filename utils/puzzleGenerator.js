/**
 * 密码谜题生成器
 */
class PuzzleGenerator {
	constructor() {
		this.usedAnswers = new Set()
	}

	/**
	 * 生成一个新的谜题
	 * @param {Object} config 配置参数
	 * @param {number} config.level 关卡等级
	 * @param {number} config.digitCount 密码位数(默认3)
	 * @param {number} config.hintCount 提示数量(默认5)
	 * @returns {Object} 谜题对象
	 */
	generatePuzzle(config = {}) {
		const {
			level = 1,
			digitCount = 3,
			hintCount = 5
		} = config

		// 生成答案
		const answer = this.generateAnswer(digitCount)
		
		// 生成提示
		const hints = this.generateHints({
			answer,
			hintCount,
			level
		})

		return {
			answer,
			userInput: Array(digitCount).fill(''),
			hints,
			level,
			description: this.getLevelDescription(level)
		}
	}

	/**
	 * 生成不重复的答案
	 */
	generateAnswer(digitCount) {
		let answer
		do {
			answer = ''
			const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
			
			for(let i = 0; i < digitCount; i++) {
				const index = Math.floor(Math.random() * digits.length)
				answer += digits.splice(index, 1)[0]
			}
		} while(this.usedAnswers.has(answer))
		
		this.usedAnswers.add(answer)
		return answer
	}

	/**
	 * 生成提示信息
	 */
	generateHints({answer, hintCount, level}) {
		const hints = []
		const usedCodes = new Set()
		
		// 确保提示有用且不重复
		while(hints.length < hintCount) {
			const code = this.generateHintCode(answer.length)
			if(usedCodes.has(code)) continue
			
			const comparison = this.compareNumbers(code, answer)
			const message = this.getHintMessage(comparison)
			if(!message) continue // 跳过无效提示
			
			usedCodes.add(code)
			hints.push({
				code,
				message,
				isLocked: hints.length >= (hintCount - Math.floor(level/2)) // 根据等级锁定部分提示
			})
		}
		
		return hints
	}

	/**
	 * 生成提示用的数字组合
	 */
	generateHintCode(length) {
		let code = ''
		for(let i = 0; i < length; i++) {
			code += Math.floor(Math.random() * 10).toString()
		}
		return code
	}

	/**
	 * 比较猜测值与答案
	 */
	compareNumbers(guess, answer) {
		let correctCount = 0
		let correctPosition = 0
		
		const guessArr = guess.split('')
		const answerArr = answer.split('')
		
		// 检查位置正确的数字
		for(let i = 0; i < guessArr.length; i++) {
			if(guessArr[i] === answerArr[i]) {
				correctPosition++
			}
		}
		
		// 检查数字正确但位置错误的
		const guessSet = new Set(guessArr)
		const answerSet = new Set(answerArr)
		guessSet.forEach(num => {
			if(answerSet.has(num)) {
				correctCount++
			}
		})
		
		correctCount = correctCount - correctPosition // 减去位置正确的，避免重复计算
		
		return {
			correctCount,
			correctPosition
		}
	}

	/**
	 * 根据比较结果生成提示消息
	 */
	getHintMessage({correctCount, correctPosition}) {
		if(correctCount === 0 && correctPosition === 0) {
			return '都不正确'
		}
		if(correctPosition > 0) {
			return `${correctPosition}个号码正确，且位置正确`
		}
		if(correctCount > 0) {
			return `${correctCount}个号码正确，但是位置不正确`
		}
		return null
	}

	/**
	 * 获取关卡描述
	 */
	getLevelDescription(level) {
		const descriptions = [
			'新手关卡：热身题目，帮助你熟悉游戏规则',
			'初级关卡：需要仔细分析每条提示',
			'中级关卡：提示信息更复杂，需要更多推理',
			'高级关卡：限制提示数量，考验解题技巧',
			'专家关卡：提示更具迷惑性，需要缜密思维'
		]
		return descriptions[Math.min(level - 1, descriptions.length - 1)]
	}
}

export default new PuzzleGenerator() 