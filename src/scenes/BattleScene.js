import React , {useEffect, useState}from 'react'
import {useHistory} from 'react-router-dom'
import {
  Container,
  Row,
  ProgressBar,
  Button,
  Image,
  Form,
  InputGroup,
  FormControl
} from 'react-bootstrap'
import axios from 'axios'

function BattleScene () {

  const [question, setQuestion] = useState([])
  const [questionNow , setQuestionNow] = useState({})
  const [idxQuestion, setIdxQuestion] = useState(0)
  const [monster, setMonster] = useState({ })
  const [hpMonster, setHpMonster] = useState(0)
  const [hpCharacter, setHpCharacter] = useState(0)
  const [characterStatus , setCharacterStatus] = useState({})
  const [username, setUsername] = useState('')
  const time = 20
  const [countdown, setCountDown] = useState(time)
  const [submittedAnswer, setSubmittedAnswer] = useState('')
  const [ intervalRunning, setIntervalRunning] = useState(true)
  const history = useHistory()

  useEffect(() => {

    setCharacterStatus(JSON.parse(localStorage.getItem('userStatus')))
    setQuestion(JSON.parse(localStorage.getItem('question')))
    setMonster(JSON.parse(localStorage.getItem('monster-now')))
    setUsername(localStorage.getItem('username'))

  }, [])

  useEffect(() => {
    console.log(intervalRunning)
    let interval 
    if(intervalRunning) {
      interval = setInterval(() => {   
        console.log('timeout invoked')
        setCountDown(countdown => countdown - 0.1)
      }, 100)
    } else {
      clearInterval(interval)
      resetCountdown()

    }

    return () => {
      console.log('cleanup')
      clearInterval(interval)
    }

  }, [intervalRunning])

  useEffect(() => {
    setHpMonster(monster.hp)
    setHpCharacter(characterStatus.hp)
  }, [monster, characterStatus])

  useEffect(() => {
    
    let idx = idxQuestion
    if(idxQuestion >= question.length){
      idx = Math.floor(Math.random() * question.length)
    }

    setQuestionNow({
      ...question[idx]
    })

  }, [question, idxQuestion])

  useEffect(() => {
    if(hpMonster && hpMonster <= 0) {

      localStorage.setItem('statusbattle' , 'win')

      axios({
        method: 'PUT',
        url: 'http://localhost:3000/combat/experience',
        headers: {
          access_token: localStorage.getItem('access_token')
        },
        data: {
          experience: monster.experience,
          money: monster.money
        }
      })
      .then(({data}) => {
        localStorage.setItem('userStatus', JSON.stringify(data.status))
        history.push('/game')
      })
      .catch(err => {
        console.log(err)
      })
    }
  }, [hpMonster])

  useEffect(() => {
    
    if(hpCharacter && hpCharacter <= 0) {
      setHpCharacter(0)
      localStorage.setItem('statusbattle' , 'lose')
      history.push('/game')
    }

  }, [hpCharacter])

  useEffect(() => {
    
    if(countdown < 0) {
      setIdxQuestion(idxQuestion + 1)
      setHpCharacter(hpCharacter - 30)
      resetCountdown()
    }

  }, [countdown])

  function resetCountdown () {
    setCountDown(time)
    setIntervalRunning(!intervalRunning)
  }

  function changeAnswer(e) {
    setSubmittedAnswer(e.target.value)
  }

  function ranAway() {
    localStorage.setItem('statusbattle' , 'lose')
    history.push('game')
  }

  function clickAnswer (e) {

      axios({
        method: 'POST',
        url: `http://localhost:3000/combat/question/${questionNow.id}`,
        headers: {
          access_token : localStorage.getItem('access_token')
        },
        data: {
          answer : submittedAnswer
        }
      })
        .then(({data}) => {
          setIdxQuestion(idxQuestion + 1)
          
          if(data.answerResult) {
            setHpMonster(hpMonster - 4)
          } else {
            setHpCharacter(hpCharacter - 30)
          }
          
          resetCountdown()
        })
        .catch(err => {
          console.log(err)
        })
  }
  return (

    <Container style={{fontFamily: 'dogicabold'}} className="mt-3">
        <Row>
          <div id="battle-scene-left" className="border border-dark col-sm-4">
          <Image
          src="https://img.itch.zone/aW1nLzE5ODA4NjQuZ2lm/original/Fe49uB.gif"
          rounded
          className="border border-dark"
          style={{
            width:"200px",
            marginLeft: "65px",
            marginTop: "25px",
            marginBottom: "25px"
          }}
          />
          <h5>
            Monster Status
          </h5>
          <div style={{fontFamily: 'dogica'}}>
          <p>{monster.name}</p>
          <p>HP: {hpMonster}</p>
          <p>Atk: {monster.atk}</p>
          <p>Def: {monster.def}</p>
          </div>
          <p>Difficulty: { monster.difficulty === 0 ? 'Easy' : monster.difficulty === 1 ? 'Normal' : 'Hard'}</p>
          </div>
          <div id="battle-scene-right" className="border border-dark col-sm-8 p-3">
            <div id="player-status">
              <h5>Player Status</h5>
              <div style={{fontFamily: 'dogica'}}>
                <p>Player Name: {username.toUpperCase()} </p>
                <ProgressBar variant="danger" now={ hpCharacter / characterStatus.hp * 100} label="HP" />
                <p>Atk: {characterStatus.atk} </p>
                <p>Def: {characterStatus.def}</p>
              </div>
            </div>
            <div id="time-box">
              <h5>Time</h5>
              <ProgressBar variant="success" now={countdown / time * 100}/>
            </div>
            {
              question && 
              <div id="question-box">
                <h5>Question</h5>
                <h5
                style={{fontFamily: 'dogica'}}
                >{questionNow.question}</h5>
                <div style={{fontFamily: 'dogica'}}>
                    <Form>
                      { questionNow.answer && 
                        questionNow.answer.split('!@!').map( ans => (
                          <Form.Check
                          key={ans} 
                          type='radio'
                          name="answer"
                          label={ans}
                          value={ans}
                          onChange={changeAnswer}
                        />
                        ))
                      }
                      <div id="battle-scene-buttons">
                      <Button className="mt-3" onClick={clickAnswer}>
                        Submit
                      </Button>
                      <Button className="mt-3 btn btn-danger" onClick={ranAway}>
                        Run Away!
                      </Button>
                      </div>
                  </Form>
                </div>
              </div>
            }
          </div>
        </Row>
    </Container>
  )
}

export default BattleScene