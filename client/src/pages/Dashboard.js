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
import Axios from "axios";
import Loading from "../components/Loading.js";


const validation = yup.object().shape({
  client: yup.string(),
  subject: yup.string().required("Assunto obrigatorio"),
  obs: yup.string().required('Descrição é obrigatorio').min(10, 'Minimo de 10 caracteres').max(300, 'Maximo de 300 caracteres'),
})



export default function Dashboard() {

  const resolveAfter3Sec = new Promise(resolve => setTimeout(resolve, 3000))


  const { user, baseURL } = useContext(AuthContext)
  const [tasks, setTasks] = useState([])
  let list = []
  const [loading, setLoading] = useState(true)
  const [lastTask, setLastTask] = useState()
  const [firstTask, setFirstTask] = useState()
  const [loadingMore, setLoadingMore] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [firstPage, setFirstPage] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)



  const [newTask, setNewTask] = useState({})
  const [client, setClient] = useState(user.name)
  const [clients, setClients] = useState([])
  const [priority, setPriority] = useState()
  const [subject, setSubject] = useState()
  const [taskType, setTaskType] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [status, setStatus] = useState('Criado')
  const [created, setCreated] = useState()
  const [obs, setObs] = useState([])
  const [prioritys, setPrioritys] = useState(['Baixa', 'Média', 'Alta'])
  const [subjects, setSubjects] = useState([])
  const [statusList, setStatusList] = useState([])
  const [disable, setDisable] = useState(true)
  const [images, setImages] = useState([])
  const [taskImages, setTaskImages] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [taskTypeList, setTaskTypeList] = useState([])


  let obsList = []
  let imagesList = []
  let newTasks = []
  let newObsList = []



  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validation)
  })


  useEffect(() => {

    async function loadClients() {
      await Axios.get(`${baseURL}/getUsers`).then((response) => {
        let list = []
        setClients(response.data)

      })

      getDocs()
    }

    loadClients()

    if (user.group === 'admin') {
      setIsAdmin(true)
      setDisable(false)
    }


  }, [])


  useEffect(()=>{
    async function loadStatus() {

      let listStatus = []
      let listSubject = []
      let taskTypeList = []
      await Axios.get(`${baseURL}/getStatus`).then((response) => {
          
          response.data.forEach((doc) => {
            listStatus.push({
                  id: doc.id,
                  status: doc.status,
                  
              })
              
          })
          
          setStatusList(listStatus)   
      })

      await Axios.get(`${baseURL}/getSubjects`).then((response) => {
        response.data.forEach((doc) => {
            console.log(doc.subject)
            listSubject.push({
                id: doc.id,
                subject: doc.subject,
                taskType: doc.taskType
            })

        })

        setSubjectList(listSubject)
    })

    await Axios.get(`${baseURL}/getTaskTypes`).then((response) => {
                
      response.data.forEach((doc) => {
        taskTypeList.push({
              id: doc.id,
              taskType: doc.taskType,
              
          })
          
      })
      
      setTaskTypeList(taskTypeList)   
  })
      
  }
  loadStatus()
  console.log(statusList)
  }, [])

  async function getDocs() {

    setTasks([])
    await Axios.get(`${baseURL}/getObsList`).then((response) => {
      // loadTasks(response.data)
      newObsList = response.data
      Axios.get(`${baseURL}/getTasks`).then((response) => {
        
        // loadTasks(response.data)
        newTasks = response.data
        // loadTasks(newTasks, newObsList)
        
        if (user.group === "admin") {
          loadTasks(newTasks, newObsList)

        } else {
          const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
          const obsDocs = newObsList.filter((o) => user.name === o.client)
          loadTasks(tasksDocs, obsDocs)


        }
      })
    })


  }

  async function loadTasks(docs, obs) {

    if (docs.length < 2) {
      setIsEmpty(true)
    }
    
    const isTaksEmpty = docs.length === 0

    if (!isTaksEmpty) {
      docs.forEach((doc) => {
        obsList = obs.filter((o) => doc.taskId === o.taskid)
        list.push({
          taskId: doc.taskId,
          client: doc.client,
          created: doc.created,
          obs: obsList,
          priority: doc.priority,
          status: doc.status,
          type: doc.type,
          subject: doc.subject,
          userId: doc.userId,
          taskImages: doc.taskImages,
          userEmail: doc.userEmail
        })
        obsList = []
      })


      const lastDoc = docs[docs.length - 1]
      setLastTask(lastDoc)
      setFirstTask(docs[0])
      setTasks(tasks => [...tasks, ...list])
      setLoading(false)

      console.log(lastTask)
      console.log(firstTask)

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
    emailjs.send("service_uw92p6x", "template_a9s048m", templateParams, "BrAq6Nxcac_3F_GXo")
      .then((response) => {
        console.log("Email enviado ", response.status, response.text)
      })
  }

  async function saveTask(e) {

    let taskImagesList = []


    for (let i = 0; i < images.length; i++) {
      await firebase.storage().ref(`task-images/${user.id}/${images[i].name}`)
        .put(images[i])
        .then(async () => {
          await firebase.storage().ref(`task-images/${user.id}`)
            .child(images[i].name).getDownloadURL()
            .then(async (url) => {
              taskImagesList.push(url)
            })
        })

    }
    setTaskImages(taskImagesList)

    setNewTask({
      client: client,
      subject: subject,
      status: status,
      priority: priority,
      type: taskType,
      created: created,
      obs: obs,
      userId: user.id,
      // taskImages: taskImagesList,
      userEmail: user.email
    })

    await Axios.post(`${baseURL}/registertask`, {
      client: client,
      subject: subject,
      priority: priority,
      status: status,
      type: taskType,
      created: created,
      obs: obs,
      userId: user.id,
      // taskImages: taskImagesList,
      userEmail: user.email
    }).then(async () => {
      await Axios.post(`${baseURL}/searchtask`, {
        client: client,
        created: created,
        obs: obs,
        userEmail: user.email,
        userId: user.id
      }).then((response) => {
        console.log(response)
        saveObs(response.data[0])
        saveImages(response.data[0], taskImagesList)
        const newObs = {
          client: response.data[0].client,
          created: response.data[0].created,
          obs: response.data[0].obs,
          taskid: response.data[0].id
        }

        const newImage = {
          client: response.data[0].client,
          created: response.data[0].created,
          image: response.data[0].obs,
          taskid: response.data[0].id
        }
        obsList.push(newObs)
        imagesList.push(newImage)
        setTasks([
          ...tasks,
          {
            id: response.data[0].id,
            client: client,
            subject: subject,
            priority: priority,
            status: status,
            type: taskType,
            created: created,
            obs: obsList,
            userId: user.id,
            taskImages: imagesList,
            userEmail: user.email
          }
        ])
      })
    })

    toast.success("Chamado registrado !")
    setTasks('')
    // saveImages(images)
    closeForm()
    getDocs()
    sendEmail()


  }

  async function nextTasks() {

    setLoadingMore(true)

    await Axios.get(`${baseURL}/getObsList`).then((response) => {
      newObsList = response.data
      Axios.post(`${baseURL}/getNextTasks`, {
        taskId: lastTask.taskId
      }).then((response) => {
        newTasks = response.data

        if (response.data.length > 0) {
          if (user.group === "admin") {
            setTasks("")
            loadTasks(newTasks, newObsList)
            setFirstPage(false)

          } else {
            setTasks("")
            const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
            const obsDocs = newObsList.filter((o) => user.name === o.client)
            loadTasks(tasksDocs, obsDocs)
            setFirstPage(false)
          }
        } else {
          setLoadingMore(false)
          setIsEmpty(true)
          toast.warning("Não existem mais chamados")

        }
      })
    })


  }

  async function previousTasks() {


    setLoadingMore(true)

    console.log(firstTask)

    await Axios.get(`${baseURL}/getObsList`).then((response) => {
      newObsList = response.data
      Axios.post(`${baseURL}/getPreviousTasks`, {
        taskId: firstTask.taskId
      }).then((response) => {
        newTasks = response.data

        if (response.data.length > 0) {
          if (user.group === "admin") {
            setTasks("")
            loadTasks(newTasks, newObsList)
            setIsEmpty(false)

          } else {
            setTasks("")
            const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
            const obsDocs = newObsList.filter((o) => user.name === o.client)
            loadTasks(tasksDocs, obsDocs)
            setIsEmpty(false)
          }
        } else {
          setLoadingMore(false)
          setFirstPage(true)
          toast.warning("Não existem páginas anteriores")
        }
      })
    })


  }


  function showForm(e) {
    e.preventDefault()
    const fullDate = format(new Date(), "dd/MM/yyyy HH:mm")
    setCreated(fullDate)

    document.querySelector('.form-task').classList.toggle('show-form-task')
    document.querySelector('.new').classList.toggle('hide')


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

    if (user.group === "admin") {
      await Axios.get(`${baseURL}/getTasks`).then((response) => {
        setIsEmpty(false)
        setLoadingMore(false)
        const tasksDocs = response.data.filter((t) => t.type === e.target.value)
        loadTasks(tasksDocs, newObsList)
      })
    } else {
      await Axios.get(`${baseURL}/getTasks`).then((response) => {
        const tasksDocs = response.data.filter((t) => t.type === e.target.value && user.email === t.userEmail)
        const obsDocs = newObsList.filter((o) => user.name === o.client)
        setIsEmpty(false)
        setLoadingMore(false)
        loadTasks(tasksDocs, obsDocs)
      })



    }


    // loadTasks(filterDocs, newObsList)
  }

  async function orderBy(e) {
    setTasks('')

    if (e === 'concluded') {
      const order = 'created'
      const docs = await firebase.firestore().collection('tasks').orderBy(order, 'asc').get()
      await loadTasks(docs)
    } else {
      const order = e
      const docs = await firebase.firestore().collection('tasks').orderBy(order, 'asc').get()
      await loadTasks(docs)
    }

  }

  async function saveObs(doc) {

    Axios.post(`${baseURL}/registerobs`, {
      client: doc.client,
      created: doc.created,
      obs: doc.obs,
      taskid: doc.taskId
    })


  }

  async function saveImages(doc, images) {


    images.map((i) => {

      Axios.post(`${baseURL}/registerImage`, {
        client: doc.client,
        created: doc.created,
        image: i,
        taskid: doc.taskId
      })
    })


  }

  function handleSubjects(value){
    setTaskType(value)
    console.log(subjectList)
    console.log(value)

    setSubjects(subjectList.filter((s)=> s.taskType === value))

    // console.log(lista)
  }



  if (loading) {
    return (

      <div className="rigth-container">
        <Sidebar />
        <div className="title">
          <Title name="Chamados">
            <FiMessageSquare size={22} />
          </Title>
          <div className="new-task">
            <Loading />
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
        <form className="form-task" onSubmit={handleSubmit(save)}>
          <div className="form-div form-div-task">
            <div className="tipo_select">
              <label>Tipo</label>
              <select name="taskType" {...register("taskType")} multiple={false} value={taskType} onChange={(e) => { handleSubjects(e.target.value) }}>
                <option hidden value={''} >Selecione o tipo de chamado</option>
                {taskTypeList.map((s, index) => {
                  return (
                    <option value={s.taskType} key={s.id}>{s.taskType}</option>
                  )
                })}
              </select>

            </div>
            <div className="subject_select">
              <label>Assunto</label>
              <select name="subject" {...register("subject")} multiple={false} value={subject} onChange={(e) => { setSubject(e.target.value) }}>
                <option hidden value={''} >Selecione o assunto</option>
                {subjects.map((s, index) => {
                  return (
                    <option value={s.subject} key={s.id}>{s.subject}</option>
                  )
                })}
              </select>
            </div>
            <div className="priority_select">
              <label>Prioridade</label>
              <select name="priority" {...register("priority")} multiple={false} value={priority} onChange={(e) => { setPriority(e.target.value) }}>
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
              <select disabled={disable} name="status" {...register("status")} multiple={false} value={status} onChange={(e) => { setStatus(e.target.value) }}>
                <option hidden value={''} >Selecione o status</option>
                {statusList.map((s) => {
                  return (
                    <option value={s.status} key={s.id}>{s.status}</option>
                  )
                })}
              </select>
            </div>
            <div className="created">
              <label>Criando em</label>
              <input value={created || ''} name="created" disabled={true} {...register("created")} onChange={(e) => { setCreated(e.target.value) }} placeholder="Criado em" />
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
              <select name="selectedType" {...register("selectedType")} multiple={false} value={selectedType} onChange={(e) => { filter(e) }}>
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
                <select name="selectedType" {...register("selectedType")} multiple={false} value={selectedType} onChange={(e) => { filter(e) }}>
                  <option hidden value={''} >Selecione o tipo de chamado</option>
                  <option value="TI">TI</option>
                  <option value="Estrutura">Estrutura</option>
                </select>
              </div>
            </div>
            {/* <TasksTable tasks={tasks} order={orderBy} getDoc={getDocs} disable='true' /> */}
            {loadingMore ? <Loading /> : <TasksTable tasks={tasks} order={orderBy} getDoc={getDocs} disable='true' />}

            {!loadingMore && !firstPage && <button className="button-hover" onClick={previousTasks}>Página Anterior</button>}
            {!loadingMore && !isEmpty && <button className="button-hover" onClick={nextTasks}>Proxima Página</button>}
            {!loadingMore && <button className="button-hover" onClick={(e) => TasksReport(tasks)}>Imprimir</button>}

          </div>
        }
      </div>
    </div>
  )
}