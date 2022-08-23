import React, {useState , useEffect} from "react"
import './App.css';

const App = () => {

  const [todoList, setTodoList] = useState([])
  const [activeItem, setActiveItem] = useState({ id:null, title: "", isCompleted: false })
  const [isEditing, setIsEditing] = useState(false)

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

  useEffect(() => {
    fetchTasks()

  }, [])

  function fetchTasks(){
    fetch("http://127.0.0.1:8000/api/task-list/")
    .then(response => response.json())
    .then(data => setTodoList(data))
  }

  function handleChange(e){
    const {name, value} = e.target
    setActiveItem(oldActiveItem => ({...oldActiveItem, title:value}))
  }

  function handleSubmit(e){
    e.preventDefault()
    let csrftoken = getCookie('csrftoken');
    let url = "http://127.0.0.1:8000/api/task-create/"
    if (isEditing){
      url = `http://127.0.0.1:8000/api/task-update/${activeItem.id}`
      setIsEditing(false)
    }
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken" : csrftoken,
      },
      body: JSON.stringify(activeItem)
    }).then(response => {
      fetchTasks()
    }).then(response => {
      setActiveItem({ id:null, title: "", isCompleted: false })
    }).catch((error) => {
      console.log("Error: ", error)
    } )
  }

  function startEditing(task){
    setActiveItem(task)
    setIsEditing(true)
  }

  function deleteTask(task){
    const csrftoken = getCookie('csrftoken');
    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}`,{
      method: "DELETE",
      headers: {
        'Content-Type' : 'application/json',
        'X-CSRFToken' : csrftoken,
      },
    }).then(response => fetchTasks())
  }

  function toggleIsCompleted(task){
    const csrf = getCookie('csrftoken')
    const url = `http://127.0.0.1:8000/api/task-update/${task.id}`
    fetch(url, {
      method: "POST",
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrf,
      },
      body: JSON.stringify({...task, isCompleted: !task.isCompleted})
    }).then(response => fetchTasks())
    
  }


  const allTasks = todoList.map((task, index) => {
    return(
      <div key={index} className="task-wrapper flex-wrapper" >
        <div style={{flex:7}} onClick={() => toggleIsCompleted(task)}>
          {!task.isCompleted ? <span>{task.title}</span> : <strike>{task.title}</strike> }
        </div>
        <div style={{flex:1}} onClick={() => startEditing(task)}>
          <button className="btn-sm btn-outline-info">Edit</button>
        </div>
        <div style={{flex:1}} onClick={() => deleteTask(task)}>
          <button className="btn-sm btn-outline-dark delete">-</button>
        </div>                
      </div>
    )
  })



    return(
      <div className="container">

      <div id="task-container">
          <div  id="form-wrapper">
             <form onSubmit={handleSubmit}  id="form">
                <div className="flex-wrapper">
                    <div style={{flex: 6}} onChange={handleChange}>
                        <input className="form-control" value={activeItem.title} id="title"  type="text" name="title" placeholder="Add task.." />
                     </div>

                     <div style={{flex: 1}}>
                        <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                      </div>
                  </div>
            </form>
         
          </div>

          <div  id="list-wrapper">         
              {allTasks}
          </div>
      </div>
      
    </div>
    )
  }

export default App;
