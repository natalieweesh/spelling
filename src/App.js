import React, { useEffect, useRef, useState } from 'react';
import words from './words/twl18.json';
import correct from './sounds/correct.mp3';
import incorrect from './sounds/incorrect.mp3';
import './App.css';

const TOTAL = 178691;
const POOP = '2143381f-2df4-4aca-a751-a9bde3981dbe';

function App() {
  const timer = useRef(null);
  const textBox = useRef(null);
  const correctSound = useRef(null);
  const incorrectSound = useRef(null);
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
  const [soundPlaying, setSoundPlaying] = useState(false);

  const speak = (words, timeout = 0) => {
    setTimeout(() => {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      window.responsiveVoice.speak(words, isChrome ? "UK English Female" : "US English Female")
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
    correctSound.current.pause();
    correctSound.current.currentTime = 0;
    incorrectSound.current.pause();
    incorrectSound.current.currentTime = 0;
    setTimeout(() => {
      speak(word)
    }, 50)
  }

  const checkAnswer = () => {
    const correct = answer.trim().toLowerCase() === word;
    return correct;
  }

  const define = () => {
    fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${POOP}`, {
      method: "GET",
      credentials: 'omit'
    }).then(response => response.json()).then((res) => {
      const def = res[0]['shortdef'] && res[0]['shortdef'][0];
      if (def) {
        speak(def)
      } else {
        speak('definition unavailable')
      }
    }).catch((err) => {
      console.log('error', err);
    });
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
          correctSound.current.play().then(() => setSoundPlaying(true));
          correctSound.current.addEventListener('ended', (res) => {
            setSoundPlaying(false);
            newWordButton.current.focus();
          })
        } else {
          incorrectSound.current.play().then(() => setSoundPlaying(true));
          incorrectSound.current.addEventListener('ended', (res) => {
            setSoundPlaying(false);
            newWordButton.current.focus();
          })
        }
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
        {!counting && <button ref={newWordButton} disabled={counting || soundPlaying} onClick={(e) => {
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
            correctSound.current.play().then(() => setSoundPlaying(true));
            correctSound.current.addEventListener('ended', (res) => {
              setSoundPlaying(false);
              newWordButton.current.focus();
            })
            setCorrectAnswered(correctAnswered + 1);
          } else {
            incorrectSound.current.play().then(() => setSoundPlaying(true));
            incorrectSound.current.addEventListener('ended', (res) => {
              setSoundPlaying(false);
              newWordButton.current.focus();
            })
          }
          setTimeout(() => {
            newWordButton.current.focus();
          }, 50)
        }}>
          <input ref={textBox} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
          <button disabled={submitted} type="submit">OK</button>
        </form>
        <div className="feedback">
          <div className="smallerButtons">
            {counting && <button className="define" onClick={define}>Definition?</button>}
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
          </div>
          <div className={checkAnswer() ? 'right' : 'wrong'}>{submitted && (checkAnswer() ? 'good job' : 'oops! here\'s the correct spelling:')}</div>
          <div>{submitted && !checkAnswer() && word}</div>
          <div className="audio">
          <audio controls ref={correctSound}>
            <source src={correct} type="audio/mpeg"/>
          </audio>
          <audio controls ref={incorrectSound}>
            <source src={incorrect} type="audio/mpeg"/>
          </audio>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
