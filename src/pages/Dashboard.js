import { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Title from "../components/Title";
import { FiEdit2, FiMessageSquare, FiPlus, FiSearch } from "react-icons/fi";
import { Link } from 'react-router-dom'
import Modal from "../components/Modal";
import firebase from '../services/firebaseConnection';
import TasksTable from "../components/TasksTable"

import { AuthContext } from "../context/auth";
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { format } from 'date-fns'
import emailjs from '@emailjs/browser'
import TasksReport from "../documents/TasksReport";


const validation = yup.object().shape({
  client: yup.string(),
  subject: yup.string().required("Assunto obrigatorio").min(5, "Minimo de 5 caracteres").max(15, "Maximo de 15 caracteres"),
  obs: yup.string().required('Descrição é obrigatorio').min(10, 'Minimo de 10 caracteres').max(300, 'Maximo de 300 caracteres'),
})



export default function Dashboard() {

  const resolveAfter3Sec = new Promise(resolve => setTimeout(resolve, 3000))

  const { user } = useContext(AuthContext)
  const [tasks, setTasks] = useState([])
  let list = []
  const [task, setTask] = useState('')
  const [type, setType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastTask, setLastTask] = useState()
  const [loadingMore, setLoadingMore] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)


  const [newTask, setNewTask] = useState({})
  const [client, setClient] = useState(user.name)
  const [clients, setClients] = useState([])
  const [priority, setPriority] = useState()
  const [subject, setSubject] = useState()
  const [taskType, setTaskType] = useState(['TI', 'Estrutura'])
  const [selectedType, setSelectedType] = useState('')
  const [status, setStatus] = useState('Criado')
  const [created, setCreated] = useState()
  const [obs, setObs] = useState([])
  const [prioritys, setPrioritys] = useState(['Baixa', 'Média', 'Alta'])
  const [subjectsTi, setSubjectsTi] = useState(['Impressora', 'Sistema', 'Internet'])
  const [subjectsGeneral, setSubjectsGeneral] = useState(['Eletrica', 'Pintura', 'Ar Condicionado', 'Hidraulico', 'Portas', 'Outros'])
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState(['Criado', 'Aberto', 'Em andamento', 'Enviado p/ tec', 'Aguardando liberação', 'Fechado'])
  const [disable, setDisable] = useState(true)
  const [images, setImages] = useState([])
  const [newList, setNewList] = useState([])
  let fullDate = ''
  let obsList = []



  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validation)
  })


  useEffect(() => {

    async function loadClients() {
      await firebase.firestore().collection('clients').orderBy('name','asc').get()
        .then((snapshot) => {
          let list = []

          snapshot.forEach((doc) => {
            list.push({
              id: doc.id,
              client: doc.data().name
            })
          })
          console.log(list)
          setClients(list)

        })
        .catch((error) => {
          console.log(error)
        })

    }

    loadClients()
    getDocs()

    if (user.group === 'admin') {
      setIsAdmin(true)
      setDisable(false)
    }

 
  }, [])

  useEffect(() => {
    
    if(taskType === "TI"){
      setSubjects(subjectsTi)
    }else{
      setSubjects(subjectsGeneral)
    }

  }, [taskType])

  async function getDocs() {
    setTasks('')
    if (user.group === "admin") {
      const docs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').limit('10').get()
      await loadTasks(docs)
    } else {
      const docs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').where("client", "==", user.name).limit('10').get()
      await loadTasks(docs)

    }


  }
  async function loadTasks(docs) {

    const isTaksEmpty = docs.size === 0

    if (!isTaksEmpty) {
      docs.forEach((doc) => {
        list.push({
          id: doc.id,
          client: doc.data().client,
          created: doc.data().created,
          obs: doc.data().obs,
          priority: doc.data().priority,
          status: doc.data().status,
          type: doc.data().type,
          subject: doc.data().subject,
          userId: doc.data().userId,
          taskImages: doc.data().taskImages,
          userEmail: doc.data().userEmail
        })
      })

      console.log(list)

      const lastDoc = docs.docs[docs.docs.length - 1]
      setLastTask(lastDoc)
      setTasks(tasks => [...tasks, ...list])
      setLoading(false)

    } else {
      setIsEmpty(true)
      setLoading(false)

    }
    setLoadingMore(false)
  }


  const save = data => {
    saveTask()
  }

  const templateParams = {
    unity: client,
    subject: subject,
    message: obs
  }

  function sendEmail() {
    emailjs.send("service_lv8kn8j", "template_a9s048m", templateParams, "BrAq6Nxcac_3F_GXo")
      .then((response) => {
        console.log("Email enviado ", response.status, response.text)
      })
  }


  async function saveTask(e) {

    let taskImages = []

    saveObs(obs)

    for (let i = 0; i < images.length; i++) {
      await firebase.storage().ref(`task-images/${user.id}/${images[i].name}`)
        .put(images[i])
        .then(async () => {
          await firebase.storage().ref(`task-images/${user.id}`)
            .child(images[i].name).getDownloadURL()
            .then(async (url) => {
              console.log(url)
              taskImages.push(url)
            })
        })
      console.log(images[i].name)
      console.log(taskImages)

    }

    setNewTask({
      client: client,
      subject: subject,
      status: status,
      priority: priority,
      type: taskType,
      created: created,
      obs: obsList,
      userId: user.id,
      taskImages: taskImages,
      userEmail: user.email
    })
    await firebase.firestore().collection('tasks').doc().set({
      client: client,
      subject: subject,
      priority: priority,
      status: status,
      type: taskType,
      created: created,
      obs: obsList,
      userId: user.id,
      taskImages: taskImages,
      userEmail: user.email
    })
      .then(() => {
        toast.success("Chamado registrado !")
        setTasks('')
        // saveImages(images)
        closeForm()
        getDocs()
        sendEmail()
      })
      .catch((error) => {
        toast.error("Erro ao registrar chamado !")
        console.log(error)
      })


  }

  async function moreTasks() {

    setLoadingMore(true)

    if (selectedType !== "" && isAdmin === false) {
      console.log(selectedType)
      const newDocs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').where("client", "==", user.name)
        .where("type", "==", selectedType).limit('10').startAfter(lastTask).get()
      await loadTasks(newDocs)
    } else if (selectedType === "" && isAdmin === false) {
      console.log(selectedType)
      const newDocs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').where("client", "==", user.name)
        .limit('10').startAfter(lastTask).get()
      await loadTasks(newDocs)
    } else if (selectedType !== "" && isAdmin === true) {
      const newDocs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').where("type", "==", selectedType)
        .limit('10').startAfter(lastTask).get()
      await loadTasks(newDocs)
    } else if (selectedType === "" && isAdmin === true) {
      const newDocs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').limit('10').startAfter(lastTask).get()
      await loadTasks(newDocs)
    }


  }
  function newClient(t, item) {
    setType(t)
    setShowModal(!showModal)
    if (t === 'new') {
      setTask('')
    } else {
      setTask('25/01/2023')
    }
  }

  function showForm(e) {
    e.preventDefault()

    const fullDate = format(new Date(), "dd/MM/yyyy HH:mm")
    setCreated(fullDate)

    const elementForm = document.querySelector('.form-task')
    const elementButton = document.querySelector('.new')

    if (elementForm.classList.contains('hide')) {
      elementButton.classList.add('hide')
      elementForm.classList.remove('hide')
    } else {
      elementForm.classList.add('hide')
      elementButton.classList.remove('hide')

    }
  }

  function closeForm() {
    const elementForm = document.querySelector('.form-task')
    const elementButton = document.querySelector('.new')
    if (!elementForm.classList.contains('hide')) {
      elementForm.classList.add('hide')
      elementButton.classList.remove('hide')
    }
  }

  async function filter(e) {
    e.preventDefault()
    setLoading(true)
    setTasks('')
    setSelectedType(e.target.value)
    let filterDocs = ""

    if (isAdmin) {
      filterDocs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').where("type", "==", e.target.value).limit('10').get()
    } else {
      filterDocs = await firebase.firestore().collection('tasks').orderBy('created', 'desc').where("client", "==", user.name)
        .where("type", "==", e.target.value).limit('10').get()
    }

    setIsEmpty(false)
    setLoadingMore(false)
    loadTasks(filterDocs)
  }

  async function orderBy(e){
    setTasks('')
    
    if(e === 'concluded'){
      const order = 'created'
      const docs = await firebase.firestore().collection('tasks').orderBy(order, 'asc').get()
      await loadTasks(docs)
    }else{
      const order = e      
      const docs = await firebase.firestore().collection('tasks').orderBy(order, 'asc').get()
      await loadTasks(docs)
    }

    console.log(e)
  }

  function saveObs(newObs) {
    /*   obsList = item.obs */
      console.log(obsList)
      setNewList('')
      const newOBS = {
        name: client,
        obs: newObs,
        date: fullDate
      }
      
      obsList.push(newOBS)
      setNewList(obsList)
      // saveTask()
      console.log(obsList)
    }


  if (loading) {
    return (

      <div className="rigth-container">
        <Sidebar />
        <div className="title">
          <Title name="Chamados">
            <FiMessageSquare size={22} />
          </Title>
          <div className="new-task title">
            <span>Carregando chamados !</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rigth-container">
      <Sidebar />
      <div className="title">
        <Title name="Chamados">
          <FiMessageSquare size={22} />
        </Title>
      </div>
      <div className="container-task">
        <form className="form-task hide" onSubmit={handleSubmit(save)}>
          <div className="form-div form-div-task">
            <div className="tipo_select">
              <label>Tipo</label>
              <select name="taskType" {...register("taskType")} value={taskType} onChange={(e) => { setTaskType(e.target.value) }}>
                <option hidden value={''} >Selecione o tipo de chamado</option>
                <option>TI</option>
                <option>Estrutura</option>
              </select>
              
            </div>
            <div className="subject_select">
              <label>Assunto</label>
              <select name="subject" {...register("subject")} value={subject} onChange={(e) => { setSubject(e.target.value) }}>
                <option hidden value={''} >Selecione o assunto</option>
                {subjects.map((s, index) => {
                  return (
                    <option value={s} key={index}>{s}</option>
                  )
                })}
              </select>
            </div>
            <div className="priority_select">
              <label>Prioridade</label>
              <select name="priority" {...register("priority")} value={priority} onChange={(e) => { setPriority(e.target.value) }}>
                <option hidden value={''} >Selecione a prioridade</option>
                {prioritys.map((p, index) => {
                  return (
                    <option value={p} key={index}>{p}</option>
                  )
                })}
              </select>
            </div>
            <div className="status_select">
              <label>Status</label>
              <select disabled={disable} name="status" {...register("status")} value={status} onChange={(e) => { setStatus(e.target.value) }}>
                <option hidden value={''} >Selecione o status</option>
                {stats.map((s, index) => {
                  return (
                    <option value={s} key={index}>{s}</option>
                  )
                })}
              </select>
            </div>
            <div className="created">
              <label>Criando em</label>
              <input value={created} name="created" disabled={true} {...register("created")} onChange={(e) => { setCreated(e.target.value) }} placeholder="Criado em" />
            </div>
            <div>
              <label>Anexos</label>
              <input type="file" multiple='multiple' onChange={(e) => { setImages(e.target.files) }} />
            </div>
            <div id="obs">
              <label>Observações</label>
              <textarea value={obs} name="obs" {...register("obs")} onChange={(e) => setObs(e.target.value)} placeholder="Observações" />
              
            </div>
            <div className="buttons">
              <button type='submit' >Salvar</button>
              <button onClick={(e) => showForm(e)}>Cancelar</button>
            </div>
          </div>
          <article className="error-message">
            <p>{errors.client?.message}</p>
            <p>{errors.subject?.message}</p>
            <p>{errors.status?.message}</p>
            <p>{errors.obs?.message}</p>
          </article>
        </form>
        {tasks.length === 0 ?
          <>
            <div className="new-task">
              <span>Não existem chamados registrados...</span>
              <Link to='#' className="new button-hover" onClick={showForm}> <FiPlus size={25} /> Abrir Chamado</Link>
            </div>
            <div className="filter-select">
              <label>Filtrar</label>
              <select name="selectedType" {...register("selectedType")} value={selectedType} onChange={(e) => { filter(e) }}>
                <option hidden value={''} >Selecione o tipo de chamado</option>
                <option value="TI">TI</option>
                <option value="Estrutura">Estrutura</option>
              </select>
            </div>

          </>
          :
          <div>
            <div className="new-task more-task">
              <Link to='#' className="new button-hover" onClick={showForm}> <FiPlus size={25} /> Abrir Chamado</Link>
              <div className="filter-select">
                <label>Filtrar</label>
                <select name="selectedType" {...register("selectedType")} value={selectedType} onChange={(e) => { filter(e) }}>
                  <option hidden value={''} >Selecione o tipo de chamado</option>
                  <option value="TI">TI</option>
                  <option value="Estrutura">Estrutura</option>
                </select>
              </div>
            </div>
            <TasksTable tasks={tasks} order={orderBy} getDoc={getDocs} disable='true' />
            {loadingMore && <h3>Carregando...</h3>}

            {!loadingMore && !isEmpty && <button className="button-hover" onClick={moreTasks}>Carregar Mais</button>}
            <button className="button-hover" onClick={(e)=> TasksReport(tasks)}>Imprimir</button>

          </div>
        }
      </div>
      {/* {showModal && (
        <Modal tipo={type} close={newClient} item={task} />
      )} */}
    </div>
  )
}