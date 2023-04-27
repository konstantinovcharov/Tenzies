import './App.css';
import React from "react"
import Die from "./Die"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"

export default function App() {
  const [dice, setDice] = React.useState(allNewDice())
  const [tenzies, setTenzies] = React.useState(false)
  const [count, setCount] = React.useState(0);
  const [rollHistory, setRollHistory] = React.useState(() => {
    const history = localStorage.getItem('rollHistory');
    return history ? JSON.parse(history) : [];
  });

  const lowestScore = React.useMemo(() => Math.min(...rollHistory), [rollHistory]);

  React.useEffect(() => {
    const allHeld = dice.every(die => die.isHeld)
    const firstValue = dice[0].value
    const allSameValue = dice.every(die => die.value === firstValue)
    if (allHeld && allSameValue) {
      setTenzies(true)
    }
  }, [dice])

  React.useEffect(() => {
    if (tenzies) {
      setRollHistory(prevState => [...prevState, count]);
    }    
  }, [tenzies, count])

  React.useEffect(() => {
    localStorage.setItem('rollHistory', JSON.stringify(rollHistory));
  }, [rollHistory]);

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid()
    }
  }

  function allNewDice() {
    const newDice = []
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie())
    }
    return newDice
  }

  function rollDice() {
    if (!tenzies) {
      setDice(oldDice => oldDice.map(die => {
        return die.isHeld ?
          die :
          generateNewDie()
      }))
      setCount(prevCount => prevCount + 1)
      
    } else {
      setTenzies(false)
      setDice(allNewDice())      
      setCount(0)
    }
  }

  function holdDice(id) {
    setDice(oldDice => oldDice.map(die => {
      return die.id === id ?
        { ...die, isHeld: !die.isHeld } :
        die
    }))   
  }

  const diceElements = dice.map(die => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
      
    />
  ))

  return (
    <main>
      {tenzies && <Confetti />}
      <h1 className="title">Tenzies</h1>
      <p className="instructions">Roll until all dice are the same.
        Click each die to freeze it at its current value between rolls.</p>
      <div className="dice-container">
        {diceElements}
      </div>
      <button
        className="roll-dice"
        onClick={rollDice}
      >
        {tenzies ? "New Game" : "Roll"}
      </button>     
      
      {tenzies && (
        <>
          <p>
            Congrats, you won! It took you {count} rolls.
            {lowestScore === count && " New best score!"}
          </p>
          <h2>Best score: {lowestScore}</h2>
        </>
      )}
    </main>
  )
}



