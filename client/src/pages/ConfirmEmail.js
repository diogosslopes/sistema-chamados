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
import emailjs from '@emailjs/browser'


function ConfirmEmail() {

  const { logIn, loadingAuth, user, baseURL } = useContext(AuthContext)

  const validationLogin = yup.object().shape({
    email: yup.string().email("Digite um e-mail válido").required("Digite um email válido")

  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationLogin)
  })

  const handleLogin = async (value) => {
    const templateParams = {
      email: value.email
  }
  

  emailjs.send("service_g9rl1tf", "template_8ng1o8m", templateParams, "mBCqpYRtx6G_wfeFI")
      .then((response) => {
          console.log("Email enviado ", response.status, response.text)
      })
}
  



  return (
    <div className="main-container">
      <div className="logo">
        <img src={logo} />
      </div>
      <div className="container-login">
        <h1>Confirme seu Email</h1>
        <form className="form" onSubmit={handleSubmit(handleLogin)}>
          <input type='text' name="email" placeholder="Digite o seu e-mail" {...register("email")} ></input>
          <p>{errors.email?.message}</p>
          <button type="submit">{loadingAuth ? 'Carregando...' : 'Confirmar'}</button>
        </form>
      </div>
    </div>
  );
}


export default ConfirmEmail;
