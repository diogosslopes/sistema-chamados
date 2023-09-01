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
import emailjs, { send } from '@emailjs/browser'


const validation = yup.object().shape({
  client: yup.string(),
  subject: yup.string().required("Assunto obrigatorio").min(5, "Minimo de 5 caracteres").max(15, "Maximo de 15 caracteres"),
  status: yup.string().required('Status é obrigatorio'),
  obs: yup.string().required('Descrição é obrigatorio').min(10, 'Minimo de 10 caracteres').max(300, 'Maximo de 300 caracteres'),
})


export default function Modal({ tipo, close, item }) {


  const { user } = useContext(AuthContext)
  const [newTask, setNewTask] = useState({})
  const [client, setClient] = useState(item.client)
  const [clients, setClients] = useState([])
  const [subject, setSubject] = useState(item.subject)
  const [status, setStatus] = useState(item.status)
  const [taskType, setTaskType] = useState(item.type)
  const [created, setCreated] = useState(item.created)
  const [obs, setObs] = useState(item.obs)
  const [taskImages, setTaskImages] = useState(item.taskImages)
  const [subjects, setSubjects] = useState(['Impressora', 'Sistema', 'Internet'])
  const [disable, setDisable] = useState(false)

  const [priority, setPriority] = useState(item.priority)
  const [prioritys, setPrioritys] = useState(['Baixa', 'Média', 'Alta'])
  const [stats, setStats] = useState(['Criado', 'Aberto', 'Em andamento', 'Enviado p/ tec', 'Aguardando liberação', 'Fechado'])



  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validation)
  })



  useEffect(() => {

    async function loadClients() {
      await firebase.firestore().collection('clients').get()
        .then((snapshot) => {
          let list = []

          snapshot.forEach((doc) => {
            list.push({
              id: doc.id,
              client: doc.data().name
            })
          })
          setClients(list)

        })
        .catch((error) => {
          console.log(error)
        })

    }

    loadClients()
    if (tipo === 'new') {


      const fullDate = format(new Date(), "dd/MM/yyyy HH:mm")
      setCreated(fullDate)
    }

    if (tipo === 'show') {
      setDisable(true)
      setSubject(item.subject)
      return
    }

  }, [])

  const save = data => {
    saveTask()
  }

  const templateParams = {
    unity: client,
    subject: subject,
    message: obs,
    email: "diogobrbm@gmail.com"
  }

  function sendEmail(){
    emailjs.send("service_lv8kn8j","template_shcpe8x", templateParams, "BrAq6Nxcac_3F_GXo")
    .then((response)=>{
      console.log("Email enviado ", response.status, response.text)
    })
  } 



  async function saveTask(e) {

    console.log(priority)


    await firebase.firestore().collection('tasks').doc(item.id).update({
      client: client,
      priority: priority,
      subject: subject,
      status: status, 
      type: taskType,
      obs: obs
    })
      .then(() => {
        toast.success("Edição realizada com sucesso !")
        // sendEmail()
        close()
      })
      .catch((error) => {
        toast.error("Erro ao realizar edição !")
        console.log(error)
      })
    // }

  }


  return (
    <div className="modal">
      <div className="modal-new">
        <h1>Cadastro de Chamado</h1>
        <form onSubmit={handleSubmit(saveTask)} className="form-modal" >
          <div>
            <label>Cliente</label>
            <select disabled={disable} name="client" {...register("client")} value={client} onChange={(e) => { setClient(e.target.value) }} >
              <option hidden value={''}>Selecione a unidade</option>

              {clients.map((c, index) => {
                return (
                  <option value={c.client} key={c.id}>{c.client}</option>
                )
              })}
            </select>
          </div>
          <div>
            <label>Prioridade</label>
            <select disabled={disable} name="priority" {...register("priority")} value={priority} onChange={(e) => { setPriority(e.target.value) }}>
              <option hidden value={''} >Selecione o assunto</option>
              {prioritys.map((p, index) => {
                return (
                  <option value={p} key={index}>{p}</option>
                )
              })}
            </select>
          </div>
          <div>
            <label>Assunto</label>
            <select disabled={disable} name="subject" {...register("subject")} value={subject} onChange={(e) => { setSubject(e.target.value) }}>
              <option hidden value={''} >Selecione o assunto</option>
              {subjects.map((s, index) => {
                return (
                  <option value={s} key={index}>{s}</option>
                )
              })}
            </select>
          </div>
          <div className="status_select">
            <label>Status</label>
            <select disabled={disable} name="status" {...register("status")} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option hidden value={''}>Selecione o status</option>
              {stats.map((s, index) => {
                return (
                  <option value={s} key={index}>{s}</option>
                )
              })}
            </select>
          </div>
          <div className="type_select">
            <label>Tipo</label>
            <select disabled={disable} name="taskType" {...register("taskType")} value={taskType} onChange={(e) => setTaskType(e.target.value)}>
              <option hidden value={''}>Selecione o tipo de chamado</option>
              <option>TI</option>
              <option>Estrutura</option>

            </select>
          </div>
          <div>
            <label>Criando em</label>
            <input value={created} name="created" {...register("created")} onChange={(e) => setCreated(e.target.value)} disabled={true} placeholder="Criado em" />
          </div>
          <div className="imagesList">
            <label>Anexos</label>
            <div className="list">
              {
                
                taskImages.map((images, index)=>{
                  return (
                    <a target="_blank" href={`${images}`}>{`Imagem ${index +1}`}</a>
                  )
                })
              }
            </div>
          </div>
          <div id="obs">
            <label>Observações</label>
            <textarea value={obs} name="obs" {...register("obs")} onChange={(e) => setObs(e.target.value)} disabled={disable} placeholder="Observações" />
          </div>
          <article className="error-message">
            <p>{errors.client?.message}</p>
            <p>{errors.subject?.message}</p>
            <p>{errors.status?.message}</p>
            <p>{errors.obs?.message}</p>
          </article>
          <div className="buttons">
            <button type='submit' >Salvar</button>
            <button onClick={close}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}