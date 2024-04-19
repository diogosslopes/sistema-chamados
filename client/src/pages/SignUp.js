import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../images/Logo.png'
import logoEngrenagem from '../images/logo-engrenagem.png'
import { AuthContext } from "../context/auth";
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"


function SignUp() {

  const { registerUser, loadingAuth } = useContext(AuthContext)

  const navigate = useNavigate()

  const validationLogin = yup.object().shape({
    name: yup.string().required("Digite seu nome"),
    login: yup.string().email("Digite um email válido").required("Digite seu email"),
    password: yup.string().required("Digite sua senha").min(6, "A senha deve conter mais de 6 caracteres")
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationLogin)
  })

  const signUp = (value) => {
    registerUser(value)

  }




  return (
    <div className="main-container">
      <div className="logo">
        <img src={logo} />
      </div>
      <div className="container-login">
        <h1>Cadastro de usuario</h1>
        <form className="form" onSubmit={handleSubmit(signUp)}>
          <input type='text' name="name" placeholder="Digite seu Nome" {...register("name")} ></input>
          <p>{errors.name?.message}</p>
          <input type='text' name="login" placeholder="Digite seu Login" {...register("login")} ></input>
          <p>{errors.login?.message}</p>
          <input type='password' name="password" {...register("password")} placeholder="Digite sua senha"></input>
          <p>{errors.password?.message}</p>
          <button type="submit">{loadingAuth ? 'Carregando...' : 'Cadastrar'}</button>

        </form>
        <Link to='/'>Já possui cadastro? Clique aqui</Link>
      </div>
    </div>
  );
}


export default SignUp;