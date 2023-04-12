import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Title from "../components/Title";
import { FiEdit2, FiSearch, FiDelete, FiTrash } from "react-icons/fi";
import { Link } from 'react-router-dom'
import Modal from "../components/Modal";
import firebase from '../services/firebaseConnection';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteModal from "./DeleteModal";


export default function TasksTable({ tasks }) {


    const [task, setTask] = useState('')
    const [taskId, setTaskId] = useState('')
    const [type, setType] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    

    function editClient(t, item) {
        setType(t)
        setShowModal(!showModal)
        if (t === 'edit') {
            setTask(item)
        } else {
            setTask(item)
        }
    }


    async function deleteTask(id) {
        setTaskId(id)
        setShowDeleteModal(!showDeleteModal)

    }



    return (
        <>
            <table className="table-tasks">
                <thead>
                    <tr className="table-head">
                        <th scope="col">Codigo</th>
                        <th scope="col">Cliente</th>
                        <th scope="col">Assunto</th>
                        <th scope="col">Status</th>
                        <th scope="col">Criado em</th>
                        <th scope="col">#</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => {

                        return (
                            <tr className="table-body-line" key={task.id}>
                                <td data-label="Codigo">{task.id}</td>
                                <td data-label="Cliente">{task.client}</td>
                                <td data-label="Assunto">{task.subject}</td>
                                <td data-label="Status"><span className="status">{task.status}</span></td>
                                <td data-label="Criado em">{task.created}</td>
                                <td data-label="#">
                                    <button className="task-btn edit" onClick={() => editClient('edit', task)}><FiEdit2 size={17} /></button>
                                    <button className="task-btn search" onClick={() => editClient('show', task)}><FiSearch size={17} /></button>
                                    <button className="task-btn delete" onClick={() => deleteTask(task.id)}><FiTrash size={17} /></button>
                                </td>
                            </tr>
                        )

                    })}
                </tbody>
            </table>
            {showModal && (
                <Modal tipo={type} close={editClient} item={task} />
            )}
            {showDeleteModal && (
                <DeleteModal  id={taskId} close={deleteTask} bd={"tasks"}/>
            )}

        </>



    )


}

