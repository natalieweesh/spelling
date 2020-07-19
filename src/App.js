import React, { useEffect, useRef, useState } from 'react';
import words from './words/words.json';
import './App.css';

const TOTAL = 178691;

function App() {
  const timer = useRef(null);
  const textBox = useRef(null);
  const newWordButton = useRef(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [word, setWord] = useState('');
  const [counting, setCounting] = useState(false);
  const [timesUp, setTimesUp] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswered, setCorrectAnswered] = useState(0);
  const [skipped, setSkipped] = useState(0);

  const speak = (words, timeout = 0) => {
    setTimeout(() => {
      window.responsiveVoice.speak(words)
    }, timeout)
  }

  const generateWord = () => {
    const rand = Math.floor(Math.random() * TOTAL);
    const word = words[rand];
    setWord(word);
    console.log('word', word);
    setTime(30);
    // setTime(5);
    setCounting(true);
    speak(word);
  }

  const checkAnswer = () => {
    const correct = answer.trim().toLowerCase() === word;
    return correct;
  }

  useEffect(() => {
    if (counting) {
      if (time === 0) {
        setCounting(false);
        clearTimeout(timer.current);
        setTime(0);
        setSubmitted(true);
        setTimesUp(true);
        setTotalAnswered(totalAnswered + 1);
        if (checkAnswer()) {
          setCorrectAnswered(correctAnswered + 1);
        }
        setTimeout(() => {
          newWordButton.current.focus();
        }, 50)
      } else {
        timer.current = setTimeout(() => {
          setTime(time - 1);
        }, 1000)
      }
    }
  }, [time, counting])

  return (
    <div className="App-header">
      <header>
        <p className="title">Spelling Bee Practice!</p>
        <p className="score">Your score: {correctAnswered} / {totalAnswered}</p>
        <p className="score">Words skipped: {skipped}</p>
      </header>
      <div className="main">
        <div className="timerow">
          <div className="timesup">{timesUp && 'time\'s up'}</div>
          {counting && <div className="time">{time}</div>}
        </div>
        {!counting && <button ref={newWordButton} disabled={counting} onClick={(e) => {
          generateWord();
          setSubmitted(false);
          setTimesUp(false);
          setAnswer('');
          textBox.current.focus();
        }}>Gimme a word!</button>}
        {counting && <button onClick={() => {
          speak(word);
          textBox.current.focus();
        }}>Say it again</button>}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (answer.trim().length === 0 || !counting) {
            return;
          }
          setSubmitted(true);
          console.log('answer', answer)
          clearTimeout(timer.current);
          setCounting(false);
          setTime(0);
          setTotalAnswered(totalAnswered + 1);
          if (checkAnswer()) {
            setCorrectAnswered(correctAnswered + 1);
          }
          setTimeout(() => {
            newWordButton.current.focus();
          }, 50)
        }}>
          <input ref={textBox} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <button disabled={submitted} type="submit">OK</button>
        </form>
        <div className="feedback">
          {counting && <button onClick={() => {
            setSubmitted(true);
            console.log('answer', answer)
            clearTimeout(timer.current);
            setCounting(false);
            setTime(0);
            generateWord();
            setSubmitted(false);
            setTimesUp(false);
            setAnswer('');
            setSkipped(skipped + 1);
            textBox.current.focus();
          }}>Skip word</button>}
          <div className={checkAnswer() ? 'right' : 'wrong'}>{submitted && (checkAnswer() ? 'good job' : 'oops! here\'s the correct spelling:')}</div>
          <div>{submitted && !checkAnswer() && word}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
