import React, { useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../images/Logo.png'

import { signInWithEmailAndPassword } from "firebase/auth"
import firebase from '../services/firebaseConnection'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'


function SignIn() {

  const validationLogin = yup.object().shape({
    login: yup.string().email("Digite um email válido").required("Digite seu email"),
    password: yup.string().required("Digite sua senha")
  })

  const { register, handleSubmit, formState: { errors }} = useForm({
    resolver: yupResolver(validationLogin)
  })

  const handleLogin = (value) =>{
    logIn(value)
  }

  async function logIn(value){

    console.log(value)
    // if(value.login !== '' && value.password !== ''){
      // await signInWithEmailAndPassword(firebase.auth(), value.login, value.password)
      // .then(()=>{
        // navigate('/dashboard', {replace: true})
      // })
    // }

  }




  return (
    <div className="main-container">
      <div className="logo">
        <img src={logo}/>
      </div>
      <div className="container-login">
        <h1>Login</h1>
        <form className="form" onSubmit={handleSubmit(handleLogin)}>
          <input type='text' name="login" placeholder="Digite seu Login" {...register("login")} ></input>
          <p>{errors.login?.message}</p>
          <input type='password' name="password" {...register("password")} placeholder="Digite sua senha"></input>
          <button type="submit">Logar</button>
        </form>
        <Link to='/register'>Cadastrar</Link>
      </div>
    </div>
  );
}


export default SignIn;
