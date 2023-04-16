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





export default function DeleteModal({ id, close, bd }) {




async function deleteItem() {

  await firebase.firestore().collection(bd).doc(id).delete()
      .then(() => {
          // alert("Excluido")
          toast.success("Deletado com sucesso")
          close()
      })
      .catch((error) => {
          toast.error("Erro ao excluir !")
          console.log(error)
      })
}


  return (
    <div className="modal">
     <div className="buttons">
            <button onClick={deleteItem} >Excluir</button>
            <button onClick={close}>Cancelar</button>
          </div>
   </div>
  )
}