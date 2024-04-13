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
import Axios from "axios";


const validation = yup.object().shape({
  client: yup.string(),
  status: yup.string().required('Status é obrigatorio'),
  obs: yup.string().max(300, 'Maximo de 300 caracteres'),
})


export default function Modal({ tipo, close, item, getDoc }) {

  const { user, baseURL } = useContext(AuthContext)
  const [newTask, setNewTask] = useState({})
  const [client, setClient] = useState(item.client)
  const [task, setTask] = useState()
  const [clients, setClients] = useState([])
  const [subject, setSubject] = useState(item.subject)
  const [status, setStatus] = useState(item.status)
  const [taskType, setTaskType] = useState(item.type)
  const [created, setCreated] = useState(item.created)
  const [obs, setObs] = useState([])
  const [taskImages, setTaskImages] = useState([])
  const [subjects, setSubjects] = useState(['Impressora', 'Sistema', 'Internet'])
  const [subjectsTi, setSubjectsTi] = useState(['Impressora', 'Sistema', 'Internet'])
  const [subjectsGeneral, setSubjectsGeneral] = useState(['Eletrica', 'Pintura', 'Ar Condicionado', 'Hidraulico', 'Portas', 'Outros'])
  const [disable, setDisable] = useState(false)
  let fullDate = ''
  const [obsList, setObsList] = useState([])
  const [ isObsOk, setIsObsOk] = useState(true)

  const [priority, setPriority] = useState(item.priority)
  const [prioritys, setPrioritys] = useState(['Baixa', 'Média', 'Alta'])
  const [stats, setStats] = useState(['Criado', 'Aberto', 'Em andamento', 'Enviado p/ tec', 'Aguardando liberação', 'Fechado'])



  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validation)
  })



  useEffect(() => {


    if (taskType === "TI") {
      setSubjects(subjectsTi)
    } else {
      setSubjects(subjectsGeneral)
    }



  }, [taskType])

  useEffect(() => {

    async function loadClients() {

      Axios.get(`${baseURL}/getUsers`).then((response)=>{
        let list = []
        setClients(response.data)

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

  useEffect(()=>{
    
    Axios.post(`${baseURL}/searchObs`,{
      taskid: item.taskId
    }).then((response)=>{
      setObsList(response.data)
    })

    Axios.post(`${baseURL}/searchImages`,{
      taskid: item.taskId
    }).then((response)=>{
      setTaskImages(response.data)
    })


  },[])





  const save = data => {
    saveTask()
  }

  const templateParams = {
    unity: user.name,
    subject: subject,
    message: obs,
    email: item.userEmail
  }

  function sendEmail() {
    emailjs.send("service_uw92p6x", "template_shcpe8x", templateParams, "BrAq6Nxcac_3F_GXo")
      .then((response) => {
        console.log("Email enviado ", response.status, response.text)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  async function saveTask(e) {

    console.log(client)


    Axios.put(`${baseURL}/editTask`,{
      taskId: item.taskId,
      userId: client,
      client: client, 
      priority: priority, 
      subject: subject, 
      status: status, 
      type: taskType
    }).then(()=>{
      close()
      getDoc()
      toast.success("Edição realizada!")
    })

    

  }

  function saveObs(newObs) {

    if(newObs.length < 11){
      setIsObsOk(false)
      return
    } else{
      setIsObsOk(true)
    }

    console.log(item)
    fullDate = format(new Date(), "dd/MM/yyyy HH:mm")
    // setNewList('')
    const newOBS = {
      client: user.name,
      obs: newObs,
      created: fullDate,
      taskid: item.taskId
    }

    setObsList([
      ...obsList,
      newOBS
    ])

   

  

    Axios.post(`${baseURL}/registerobs`, {
      client: newOBS.client,
      created: newOBS.created,
      obs: newOBS.obs,
      taskid: newOBS.taskid
    }).then(()=>{
      setObs("")
      toast.success("Observação salva")
      sendEmail()
      close()
    })


  }

  function handleClient (e){
    console.log(e)

    setClient(e.target.value)
    
    const clientId = document.querySelector(".clientOption")
    console.log(clientId)
  }
  
  function handleSelect (e){
    console.log(e)
    

  }

 



  return (
    <div className="modal">
      <div className="modal-new">
        <h1>Cadastro de Chamado</h1>
        <form onSubmit={handleSubmit(saveTask)} className="form-modal" >
          <div>
            <label>Cliente</label>
            <select disabled="disable" name="client" {...register("client")} onSelect={(e)=> handleSelect(e)} value={client} onChange={(e) => handleClient(e) } >
              <option hidden value={''}>Selecione a unidade</option>

              {clients.map((c, index) => {
                return (
                  <option value={c.name} id={c.clientId} className="clientOption" key={c.clientId}>{c.name}</option>
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
            {/* <a target="_blank" href={`${taskImages}`}>{`Imagem `}</a> */}
            <div className="list">
              {                
                taskImages.map((i, index)=>{
                  return (
                    <a target="_blank" href={`${i.image}`}>{`Imagem ${index +1}`}</a>
                  )
                })
              }
            </div>
          </div>
          <div id="obs">
            <label>Observações</label>
            {tipo === 'show' ?
              <div className="obs-list">
                {obsList.map((o) => {
                  return (
                    <div className="obs" key={o.id}>
                      <label>{`${o.client} - ${o.created}`}</label>
                      <textarea value={o.obs} name="obs" disabled={disable} placeholder="Observações" />
                    </div>
                  )
                })}
              </div>
              :
              <div className="new-obs">
                <textarea value={obs} name="obs" {...register("obs")} onChange={(e) => setObs(e.target.value)} disabled={disable} placeholder="Observações" />
                {!isObsOk && <p>Digite 10 caracteres ou mais.</p>}
                <button type="button" onClick={(() => { saveObs(obs) })}>Enviar</button>
                <div className="obs-list">
                  {obsList.map((o) => {
                    return (
                      <div className="obs">
                        <label>{`${o.client} - ${o.created}`}</label>
                        <textarea value={o.obs} name="obs" disabled='disable' placeholder="Observações" />
                      </div>
                    )
                  })}
                </div>
              </div>
            }
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
