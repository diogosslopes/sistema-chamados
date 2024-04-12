import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import logo from '../images/Logo.png'
import logoEngrenagem from '../images/logo-engrenagem.png'
import { AuthContext } from '../context/auth'

import firebase from '../services/firebaseConnection'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import Axios from "axios";


function ChangePassword() {

  const { logIn, loadingAuth, baseURL } = useContext(AuthContext)
  const { email } = useParams()
  const navigate = useNavigate()

  const validationLogin = yup.object().shape({
    password: yup.string().required("Digite sua senha").min(6, "A senha deve conter mais de 6 caracteres"),
    passwordConfirmation: yup.string().required("Digite sua senha").min(6, "A senha deve conter mais de 6 caracteres")
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationLogin)
  })

  const handleLogin = (value) => {
    if(value.password === value.passwordConfirmation){
      Axios.post(`${baseURL}/changePassword`, {
        email: email,
        password: value.password
      })
      toast.success("Senha alterada com sucesso!")
      navigate('/')
    }else{
      toast.warn("As senhas devem ser iguais")
    }
  }



  return (
    <div className="main-container">
      <div className="logo">
        <img src={logo} />
      </div>
      <div className="container-login">
        <h1>Recuperação de Senha</h1>
        <form className="form" onSubmit={handleSubmit(handleLogin)}>
          <input type='password' name="password" placeholder="Digite a nova senha" {...register("password")} ></input>
          <p>{errors.password?.message}</p>
          <input type='password' name="passwordConfirmation" {...register("passwordConfirmation")} placeholder="Confirme a sua senha"></input>
          <p>{errors.passwordConfirmation?.message}</p>
          <button type="submit">{loadingAuth ? 'Carregando...' : 'Alterar senha'}</button>
        </form>
        
      </div>
    </div>
  );
}


export default ChangePassword;
