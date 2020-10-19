import React, {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import axios from 'axios'
import {InputGroup, FormControl} from 'react-bootstrap'
function Login () {

  const [loginForm , setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [errForm, setErrForm] = useState('')
  const history = useHistory()
  
  useEffect(() => {
    setTimeout(() => {
      setErrForm('')
    }, 3000)
  }, [errForm])
  
  function onChangeText(event) {
    let {name , value} = event.target

    setLoginForm({
      ...loginForm, [name] : value
    })

  }

  function submitted() {
    
    axios({
      method: 'POST',
      url: 'http://localhost:3000/login',
      data: {
        email : loginForm.email,
        password : loginForm.password
      }
    })
      .then(({data}) => {
        localStorage.setItem('userStatus', JSON.stringify(data.UserStatus))
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('username', data.username)
        
        return axios ({
          method: 'GET',
          url: 'http://localhost:3000/monster',
          headers:{
            access_token : data.access_token
          }
        })
      })
      .then(({data}) => {
        localStorage.setItem('monster', JSON.stringify(data))
        history.push('/game')
      })
      .catch(err => {
        setErrForm(err.response.data.message)
      })
  }

  return (
    <>
      <div id="background">
        <div>
          <div>
              <div className="title center mt-60">
                  <h1>Script Fighter</h1>
              </div>
            <InputGroup className="mb-3 width-30 center">
              <FormControl
                type="email"
                name="email"
                placeholder="Email"
                aria-label="Email"
                onChange={onChangeText}
              />
            </InputGroup>

          </div>
          <div>
            <InputGroup className="mb-3 width-30 center">
              <FormControl
                type="password"
                name="password"
                placeholder="Password"
                aria-label="Password"
                onChange={onChangeText}
              />
            </InputGroup>
          </div>
          <div className="center w-200">
            { errForm &&
              <h4 className="title  red fs-48 bg-white-op-75 center">{errForm}</h4>
            }
          </div>
          <div className="iconstart">
            <img src="./icon/start.png" className="ml-45" onClick={submitted}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login