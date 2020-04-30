import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

// wordlist from https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt

class App extends Component {
	constructor(props) {
		super(props);
		this.state = { numOfWords: [6, 4, 2, 6], letters: 'NEHSCOIAEPOWIHAFIF', results: [], bannedWords: [] };

		this.handleClick = this.handleClick.bind(this);
		this.calculatePossibilities = this.calculateSentences.bind(this);
		this.findWords = this.findPossibleWords.bind(this);
	}

	async componentDidMount() {
		const res = await axios('word-list.txt');
		const wordlist = res.data.split('\n').map(w => w.toLowerCase());
		this.setState({
			wordlist,
			wordlistFreq: wordlist.map(this.wordToFreq),
			wordlistLen: wordlist.map(w => w.length)
		});
	}


	wordToFreq(word) {
		word = word.replace(/ /g, '');
		const obj = {};
		for (const char of word.split(''))
			obj[char] = (obj[char] || 0) + 1;
		return obj;
	}

	subtractFreqs(a, b) {
		const res = { ...a };
		for (const k in b)
			if (res[k])
				res[k] -= b[k];
		return res;
	}

	isWordPossible(wordFreq, testFreq) {
		for (const k in wordFreq)
			if (!testFreq[k] || wordFreq[k] > testFreq[k])
				return false;
		return true;
	}

	findPossibleWords(freq, length) {
		const res = [];
		let i = this.state.wordlistLen.indexOf(length);
		while (i !== -1) {
			if (this.isWordPossible(this.state.wordlistFreq[i], freq) && !this.state.bannedWords.includes(this.state.wordlist[i])) {
				res.push(this.state.wordlist[i]);
			}
			i = this.state.wordlistLen.indexOf(length, i + 1);
		}
		return res;
	}

	async calculateSentences(letters, sentenceLengths) {
		const freq = this.wordToFreq(letters.toLowerCase());
		let result = this.findPossibleWords(freq, sentenceLengths[0]);
		for (let i = 1; i < sentenceLengths.length; i++) {
			result = result.map(sentence => {
				const remainingFreq = this.subtractFreqs(freq, this.wordToFreq(sentence));
				const possibleWords = this.findPossibleWords(remainingFreq, sentenceLengths[i]);
				return possibleWords.map(word => sentence + ' ' + word);
			}).flat();
		}
		return result;
	};

	async handleClick() {
		const res = await this.calculateSentences(this.state.letters, this.state.numOfWords);
		this.setState({ results: res });
	}

	render() {
		const removeBannedWord = w => this.setState({ bannedWords: this.state.bannedWords.filter(w1 => w1 !== w) });
		const addBannedWord = w => !this.state.bannedWords.includes(w) && this.setState({ bannedWords: this.state.bannedWords.concat(w) });

		return (
			<div className="App">
				<div className="input-container">
					<div className="input-title">Letters:</div>
					<input placeholder="NEHSCOIAEPOWIHAFIF" className="input-input" onChange={v => this.setState({ letters: v.target.value })}></input>
				</div>

				<div className="input-container">
					<div className="input-title">Word Lengths:</div>
					<input placeholder="6 4 2 6" className="input-input" onChange={v => this.setState({ numOfWords: v.target.value.split(' ').map(x => Number(x)) })}></input>
				</div>

				<div className="input-container">
					<div className="input-title">Banned words:</div>
					<div className="banned-word-list">{this.state.bannedWords.map(w => <div className="word-container add" onClick={() => removeBannedWord(w)}>{w}</div>)}</div>
				</div>

				<button onClick={this.handleClick}>Unscrable Sentence</button>

				<div className="results-container">
					{this.state.results.map(x => {
						const wordlist = x.split(' ');
						return <div className="sentence-container" key={x}>
							{wordlist.map(w => <div key={w} className="word-container remove" onClick={() => addBannedWord(w)}>{w}</div>)}
						</div>
					})}
				</div>
			</div>
		);
	}
}

export default App;