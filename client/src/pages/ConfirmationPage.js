import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import logo from '../images/Logo.png'
import logoEngrenagem from '../images/logo-engrenagem.png'
import { AuthContext } from '../context/auth'

import firebase from '../services/firebaseConnection'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import Axios from "axios";


function SignIn() {

  const { logIn, loadingAuth, user, baseURL } = useContext(AuthContext)

  const validationLogin = yup.object().shape({
    emailToken: yup.string().required("Digite o codigo de confirmação")

  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationLogin)
  })

  const handleLogin = async (value) => {
    await Axios.post(`${baseURL}/confirmUser`, {
      email: user.email,
      emailToken: value.emailToken
    }).then((result) => {
      if (result.data === true) {
        const newUser = {
          login: user.email,
          password: user.password
        }
        logIn(newUser)
      } else {
        toast.error('Código de confirmação inválido')
      }
    })
  }



  return (
    <div className="main-container">
      <div className="logo">
        <img src={logo} />
      </div>
      <div className="container-login">
        <h1>Verifique seu Email</h1>
        <form className="form" onSubmit={handleSubmit(handleLogin)}>
          <input type='text' name="emailToken" placeholder="Digite o codigo enviado por e-mail" {...register("emailToken")} ></input>
          <p>{errors.emailToken?.message}</p>
          <button type="submit">{loadingAuth ? 'Carregando...' : 'Confirmar'}</button>
        </form>
      </div>
    </div>
  );
}


export default SignIn;
