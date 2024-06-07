import { useContext, useEffect, useState } from "react";
import { FiEdit2, FiSearch, FiDelete, FiTrash, FiCheck, FiClipboard } from "react-icons/fi";
import firebase from '../services/firebaseConnection';
import '../index.css'
import { format } from 'date-fns'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/auth";
import Modal from "./Modal";
import DeleteModal from "./DeleteModal";
import Axios from "axios";


export default function TasksTable({ tasks, order, getDoc, page, tipo }) {

    const { user, baseURL } = useContext(AuthContext)



    const [task, setTask] = useState('')
    const [taskId, setTaskId] = useState('')
    const [type, setType] = useState('')
    const [concluded, setConcluded] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [newTask, setNewTask] = useState()
    const [hide, setHide] = useState()
    const [show, setShow] = useState()
    const [name, setName] = useState()
    const [disable, setDisable] = useState('none')

    console.log(tasks)


    useEffect(() => {
        console.log(tipo)
        console.log(page)
        if (page === 'report') {
            setHide('hide-column')
            setShow('show-column')
        }

        if (tipo === 'evaluation') {
            setDisable('inline')
        }
    }, [tasks])

    function editClient(t, item) {

        setType(t)
        setShowModal(!showModal)
        console.log(disable)

        if (showModal === false) {
            setName(`Chamado numero ${item.taskId}`)
        }

        if (t === 'edit') {
            setTask(item)
            setName("Editar Chamado")
        } else {
            setTask(item)
        }
    }

    async function deleteTask(id) {
        setTaskId(id)
        setShowDeleteModal(!showDeleteModal)

    }

    async function completeTask(task) {


        const fullDate = format(new Date(), "yyyy-MM-dd HH:mm:ss")
        setConcluded(fullDate)

        await Axios.put(`${baseURL}/concludeTask`, {
            taskId: task.taskId,
            concluded: fullDate
        }).then(() => {
            toast.success("Chamado finalizado!")
        })

    }

    async function evaluateTask(t, item) {
        setTask(item)
        setType(t)
        setName(`Avaliação de chamado`)
        setShowModal(!showModal)
    }

    return (
        <>
            <table className="table-tasks">
                <thead>
                    <tr className="table-head">
                        <th scope="col" onClick={() => order('id', 'completedtask')}>ID</th>
                        <th scope="col" onClick={() => order('client', 'completedtask')}>Cliente</th>
                        <th scope="col" onClick={() => order('subject', 'completedtask')}>Assunto</th>
                        <th scope="col" onClick={() => order('priority', 'completedtask')}>Prioridade</th>
                        <th scope="col" onClick={() => order('status', 'completedtask')}>Status</th>
                        <th scope="col" onClick={() => order('created', 'completedtask')}>Criado em</th>
                        {page === 'completedtasks' &&
                            <>
                                <th scope="col" onClick={() => order('concluded', 'completedtask')}>Concluido em</th>
                                <th scope="col" >Nota</th>
                            </>
                        }
                        {page === 'report' &&

                            <th scope="col" >Nota</th>
                        }

                        <th scope="col" className={hide} >#</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => {
                        return (
                            <tr className="table-body-line" key={task.taskId}>
                                <td id="id-column" data-label="ID" >{task.taskId}</td>
                                <td data-label="Cliente" >{task.client}</td>
                                <td data-label="Assunto">{task.subject}</td>
                                <td data-label="Prioridade">{task.priority}</td>
                                <td data-label="Status"><span className="status">{task.status}</span></td>
                                <td data-label="Criado em">{task.created}</td>
                                {page === 'completedtasks' &&
                                    <>
                                        <td data-label="Concluido em">{task.concluded}</td>
                                        <td data-label="Nota" className={`${show}`}>{task.grade}</td>
                                    </>
                                }
                                {page === 'report' &&
                                    <td data-label="Nota" className={`${show}`}>{task.grade}</td>
                                }
                                <td data-label="#" className={hide}>
                                    {page === 'completedtasks' ?
                                        <div>
                                            <button className="task-btn search" onClick={() => editClient('show', task)}><FiSearch size={17} /></button>
                                            <button className="task-btn grade" style={{ display: disable }} onClick={() => evaluateTask('evaluate', task)}><FiClipboard size={17} /></button>
                                        </div>
                                        :
                                        <div >
                                            <button className="task-btn search" onClick={() => editClient('show', task)}><FiSearch size={17} /></button>
                                            <button className="task-btn edit" onClick={() => editClient('edit', task)}><FiEdit2 size={17} /></button>
                                            {user.group === 'admin' && (
                                                <button className="task-btn check" onClick={() => completeTask(task)}><FiCheck size={17} /></button>
                                            )}
                                            <button className="task-btn delete" onClick={() => deleteTask(task.taskId)}><FiTrash size={17} /></button>
                                        </div>

                                    }
                                </td>
                            </tr>
                        )

                    })}
                </tbody>
            </table>
            {showModal && (
                <Modal tipo={type} close={editClient} item={task} getDoc={getDoc} itens={tasks} title={name} />
            )}
            {showDeleteModal && (
                <DeleteModal id={taskId} close={deleteTask} bd={"tasks"} getDoc={getDoc} />
            )}

        </>



    )


}




























































































































































































































































































































