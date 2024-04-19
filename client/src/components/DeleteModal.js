import { useContext, useEffect, useState } from "react";
import firebase from '../services/firebaseConnection';
import '../index.css'
import { format } from 'date-fns'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/auth";
import Axios from "axios";





export default function DeleteModal({ id, close, bd, getDoc }) {

  const { getDocs, setTasks, baseURL } = useContext(AuthContext)



  async function deleteItem() {

    if (bd === 'tasks') {
      await Axios.delete(`${baseURL}/deleteobs/${id}`).then((response) => {
        Axios.delete(`${baseURL}/deletetask/${id}`).then((response) => {
          close()
          toast.success("Deletado com sucesso")
          getDoc()
        }).catch((error) => {
          toast.error("Erro ao excluir !")
        })

      })
    } else if (bd === 'clients') {
      Axios.delete(`${baseURL}/deleteClient/${id}`).then((response) => {
        toast.success("Deletado com sucesso")
        close()
      })

    } else if (bd === 'taskTypes') {
      Axios.delete(`${baseURL}/deleteTaskType/${id}`).then((response) => {
        toast.success("Deletado com sucesso")
        close()
      })

    } else if (bd === 'status') {
      Axios.delete(`${baseURL}/deleteStatus/${id}`).then((response) => {
        toast.success("Deletado com sucesso")
        close()
      })

    } else if (bd === 'subject') {
      Axios.delete(`${baseURL}/deleteSubject/${id}`).then((response) => {
        toast.success("Deletado com sucesso")
        close()
      })

    }


  }



  return (
    <div className="modal">
      <div className="delete-modal">
        <h3>Tem certeza que deseja excluir?</h3>
        <div className="buttons">
          <button onClick={deleteItem} >Sim</button>
          <button onClick={close}>Não</button>
        </div>
      </div>
    </div>
  )
}