import { FiUsers, FiTrash, FiEdit2, FiType, FiTag } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Title from "../components/Title";
import { useContext, useEffect, useState } from "react";
import firebase from '../services/firebaseConnection';

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import DeleteModal from "../components/DeleteModal";
import { AuthContext } from "../context/auth";
import Axios from "axios"




export default function Subjects() {

    const validation = yup.object().shape({
        subject: yup.string().required("Nome é obrigatório")

    })

    const { baseURL } = useContext(AuthContext)

    const [taskType, setTaskType] = useState('')
    const [taskTypeList, setTaskTypeList] = useState([])
    const [subject, setSubject] = useState()
    const [subjectList, setSubjectList] = useState([])
    const [subjectId, setSubjectId] = useState('')
    const [editing, setEditing] = useState()
    const [showModal, setShowModal] = useState()
    let listTasks = []
    let listSubject = []


    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validation)
    })

    useEffect(() => {


        async function loadTaskType() {

            await Axios.get(`${baseURL}/getTaskTypes`).then((response) => {

                response.data.forEach((doc) => {
                    listTasks.push({
                        id: doc.id,
                        taskType: doc.taskType

                    })
                })

                setTaskTypeList(listTasks)
            })


        }
        loadTaskType()
    }, [subject, subjectId])

    useEffect(() => {


        async function loadSubjects() {

            await Axios.get(`${baseURL}/getSubjects`).then((response) => {
                response.data.forEach((doc) => {
                    listSubject.push({
                        id: doc.id,
                        subject: doc.subject,
                        taskType: doc.taskType
                    })

                })

                setSubjectList(listSubject)
            })


        }
        loadSubjects()
    }, [subject, subjectId])



    const save = async value => {


        if (editing === true) {
            Axios.put(`${baseURL}/editSubject`, {
                subject: subject,
                id: subjectId,
                taskType: taskType
            }).then(() => {
                toast.success('Edição realizada com sucesso')
                setSubject('')
                setTaskType('')
                setEditing(false)
            })
        } else {
            Axios.post(`${baseURL}/registerSubject`, {
                subject: subject,
                taskType: taskType
            }).then(() => {
                toast.success('Assunto cadastrado com sucesso')
                setSubject('')
                setTaskType('')
            })

        }




    }






    function editingTaskType(c) {

        setEditing(true)
        setSubject(c.subject)
        setSubjectId(c.id)
        setTaskType(c.taskType)
    }

    function deleteItem(id) {
        setShowModal(!showModal)
        setSubjectId(id)
    }




    return (
        <div className="rigth-container">
            <Sidebar />
            <div className="title">
                <Title name="Cadastro de Assuntos">
                    <FiTag size={22} />
                </Title>
            </div>
            <div className="container-client ">
                <form className="form-profile form-options" onSubmit={handleSubmit(save)}>
                    <div className="form-div">
                        <div >
                            <label>Assunto</label>
                            <input type='text' name="subject" {...register("subject")} value={subject} onChange={(e) => setSubject(e.target.value)} />
                            <label>Tipo de chamado</label>
                            <select name="taskType" {...register("taskType")} multiple={false} value={taskType} onChange={(e) => { setTaskType(e.target.value) }}>
                                <option hidden value={''} >Selecione o tipo de chamado</option>
                                {taskTypeList.map((t) => {
                                    return (
                                        <option>{t.taskType}</option>
                                    )
                                })}
                            </select>
                            <div className="buttons">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={() => { setSubject("") }}>Limpar</button>
                            </div>
                        </div>
                        <article className="error-message">
                            <p>{errors.subject?.message}</p>
                        </article>
                    </div>
                </form>
                {subjectList.map((c) => {
                    return (
                        <div key={c.id} className="clients-list">
                            <div className="task-types-list">
                                <label>{c.subject}</label>
                                <FiEdit2 className="client-btn edit" onClick={() => editingTaskType(c)} />
                                <FiTrash className="client-btn delete" onClick={() => deleteItem(c.id)} />
                            </div>
                        </div>
                    )
                })}
            </div>
            {showModal && (
                <DeleteModal close={deleteItem} id={subjectId} bd={"subject"} />
            )}
        </div>
    )
}

