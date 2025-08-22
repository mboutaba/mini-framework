import { setRoutes, goTo } from "../framework/router.js";
import { buildElement, mount, update } from "../framework/dom.js";
import { useState } from "../framework/state.js";

const LS_KEY = 'todos-vanilla';

const [getInput, setInput] = useState('input','');
const [getTodos, setTodos] = useState('todos', JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
const [getEditing, setEditing] = useState('editing', null);
const [getEditText, setEditText] = useState('editText', '');
const [getFilter, setFilter] = useState('filter', 'All');

function persist(todos){ localStorage.setItem(LS_KEY, JSON.stringify(todos)); setTodos(todos); }

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function updateInput(e){ setInput(e.target.value); }
function addTodo(e){ if (e.key === 'Enter' && getInput().trim()){ const text=getInput().trim(); const t={id:uid(), text, done:false}; const todos=[...getTodos(), t]; persist(todos); setInput(''); } }
function toggleDone(id){ const todos = getTodos().map(t=> t.id===id?{...t, done: !t.done}:t); persist(todos); }
function remove(id){ const todos = getTodos().filter(t=> t.id!==id); persist(todos); }
function clearCompleted(){ const todos = getTodos().filter(t=> !t.done); persist(todos); }
function startEdit(todo){ setEditing(todo.id); setEditText(todo.text); }
function changeEdit(e){ setEditText(e.target.value); }
function saveEdit(id, e){ if (e.type === 'keydown' && e.key !== 'Enter') return; const text = getEditText().trim(); if (!text){ remove(id); setEditing(null); return; } const todos = getTodos().map(t=> t.id===id?{...t, text}:t); persist(todos); setEditing(null); }
function cancelEdit(){ setEditing(null); setEditText(''); }
function toggleAll(){ const allDone = getTodos().every(t=>t.done); const todos = getTodos().map(t=>({...t, done: !allDone})); persist(todos); }

function filteredTodos(){
  const f = getFilter();
  if (f === 'Active') return getTodos().filter(t=>!t.done);
  if (f === 'Completed') return getTodos().filter(t=>t.done);
  return getTodos();
}

function TodoApp(){
  const todos = getTodos();
  const visible = filteredTodos();
  const activeCount = todos.filter(t=>!t.done).length;
  const allDone = todos.length>0 && todos.every(t=>t.done);

  return {
    tag: 'section',
    attrs: { className: 'todoapp' },
    children: [
      { tag: 'header', attrs: { className: 'header' }, children: [
        { tag: 'h1', children: ['todos'] },
        { tag: 'input', attrs: { className: 'new-todo', placeholder: 'What needs to be done?', autofocus: true, value: getInput(), oninput: updateInput, onkeydown: addTodo } }
      ]},
      ...(todos.length > 0 ? [{
        tag: 'section', attrs: { className: 'main' }, children: [
          { tag: 'input', attrs: { id: 'toggle-all', className: 'toggle-all', type: 'checkbox', onclick: toggleAll, checked: allDone } },
          { tag: 'label', attrs: { for: 'toggle-all', className: 'toggle-all-label' }, children: ['Mark all as complete'] },
          { tag: 'ul', attrs: { className: 'todo-list' }, children: visible.map(todo => {
            const editing = getEditing() === todo.id;
            return {
              tag: 'li', attrs: { className: (todo.done ? 'completed ' : '') + (editing ? 'editing' : '') , dataset: { id: todo.id } }, children: [
                { tag: 'div', attrs: { className: 'view' }, children: [
                  { tag: 'input', attrs: { className: 'toggle', type: 'checkbox', onclick: () => toggleDone(todo.id), checked: todo.done } },
                  { tag: 'label', attrs: { ondblclick: () => startEdit(todo) }, children: [todo.text] },
                  { tag: 'button', attrs: { className: 'destroy', onclick: () => remove(todo.id) } }
                ]},
                ...(editing ? [{ tag: 'input', attrs: { className: 'edit', value: getEditText(), oninput: changeEdit, onkeydown: (e)=>saveEdit(todo.id,e), onblur: (e)=>saveEdit(todo.id,e) } }] : [])
              ]
            };
          }) }
        ]
      }] : []),
      { tag: 'footer', attrs: { className: 'footer' }, children: [
        { tag: 'span', attrs: { className: 'todo-count' }, children: [
          { tag: 'strong', children: [String(activeCount)] },
          ' items left'
        ]},
        { tag: 'ul', attrs: { className: 'filters' }, children: [
          { tag: 'li', children: [ { tag: 'a', attrs: { href: '#/', onclick: ()=>{ setFilter('All'); goTo('/'); } , className: getFilter()==='All' ? 'selected' : '' }, children: ['All'] } ] },
          { tag: 'li', children: [ { tag: 'a', attrs: { href: '#/active', onclick: ()=>{ setFilter('Active'); goTo('/active'); } , className: getFilter()==='Active' ? 'selected' : '' }, children: ['Active'] } ] },
          { tag: 'li', children: [ { tag: 'a', attrs: { href: '#/completed', onclick: ()=>{ setFilter('Completed'); goTo('/completed'); } , className: getFilter()==='Completed' ? 'selected' : '' }, children: ['Completed'] } ] }
        ]},
        { tag: 'button', attrs: { className: 'clear-completed', onclick: clearCompleted }, children: ['Clear completed'] }
      ]}
    ]
  };
}

const app = document.getElementById('app');
mount(TodoApp, app);

setRoutes({
  '/': () => { setFilter('All'); return TodoApp(); },
  '/active': () => { setFilter('Active'); return TodoApp(); },
  '/completed': () => { setFilter('Completed'); return TodoApp(); }
});

if (!window.location.hash) goTo('/');
