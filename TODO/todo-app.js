(function () {
    // создаем пустой массив данных для сохранения списка дел
    let listArray = [];
    let keyList = '';

    // создаем и возвращаем заголовок приложения
    function createAppTitle(title) {
        let appTitle = document.createElement('h2');
        appTitle.innerHTML = title;
        return appTitle;
    }

    // создаем и возвращаем форму для создания дела
    function createTodoItemForm() {
        let form = document.createElement('form');
        let input = document.createElement('input');
        let buttonWrapper = document.createElement('div');
        let button = document.createElement('button');

        form.classList.add('input-group', 'mb-3');
        input.classList.add('form-control');
        input.placeholder = 'Введите название нового дела';
        buttonWrapper.classList.add('input-group-append');
        button.classList.add('btn', 'btn-primary');
        button.textContent = 'Добавить дело';

        // добавляем свойство активности кнопке при условии ввода текста в поле ввода    

        button.disabled = true;

        input.addEventListener('input', function () {
            if (input.value !== '') {
                button.disabled = false;
            } else {
                button.disabled = true;
            }
        });

        buttonWrapper.append(button);
        form.append(input);
        form.append(buttonWrapper);

        // <form class="input-group mb-3">
        //     <input class="form-control" placeholder="Введите название нового дела">
        //     <div class="input-group-append">
        //         <button class="btn btn-primary">Добавить дело</button>
        //     </div>
        // </form>

        return {
            form,
            input,
            button,
        };
    }

    // создаем и возвращаем список элементов
    function createTodoList() {
        let list = document.createElement('ul');
        list.classList.add('list-group');
        return list;
    }

    // создаем элемент списка дел
    function createTodoItem(obj) {
        let item = document.createElement('li');
        // кнопки помещаем в элемент, который красиво покажет их в одной группе
        let buttonGroup = document.createElement('div');
        let doneButton = document.createElement('button');
        let deleteButton = document.createElement('button');

        // устанавливаем стили для элемента списка, а также для размещения кнопок в его правой части с помощью flex
        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        item.textContent = obj.name;
        
        buttonGroup.classList.add('btn-group', 'btn-group-sm');
        doneButton.classList.add('btn', 'btn-success');
        doneButton.textContent = 'Готово';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Удалить';

        // добавляем элементу списка дел идентификатор как свойство объекта
        item.id = obj.id;

        // добавляем статус выполнения элементу списка в зависимости от свойства объекта done
        if (obj.done) {
            item.classList.add('list-group-item-success');
        }

        // добавляем обработчики на кнопки списка дел
        doneButton.addEventListener('click', function () {
            item.classList.toggle('list-group-item-success');

            // меняем статус дела в массиве объектов при нажатии кнопки Готово
            for (const item of listArray) {
                if (item.id == obj.id) {
                    item.done = !item.done;
                }
            }

            // сохраняем список дел при нажатии кнопки Готово
            saveList(listArray, keyList);
        });

        deleteButton.addEventListener('click', function () {
            if (confirm('Вы уверены?')) {
                item.remove();

                // удаляем дело из массива объектов при нажатии кнопки Удалить
                for (let i=0; i<listArray.length; i++) {
                    if (listArray[i].id == obj.id) {
                        listArray.splice(i, 1);
                    }
                }

                // сохраняем список дел при нажатии кнопки Удалить
                saveList(listArray, keyList);
            }
        });

        // вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
        buttonGroup.append(doneButton);
        buttonGroup.append(deleteButton);
        item.append(buttonGroup);

        // приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
        return {
            item,
            doneButton,
            deleteButton,
        };
    }

    // создаем уникальный идентификатор элемента массива объектов списка дел

    function getNewID(arr) {
        let max = 0;
        for (const item of arr) {
            if(item.id > max) {
                max = item.id;
            }
        }
        return max + 1;
    }

    // сохраняем массив объектов списка дел в локальном хранилище в виде строки
    function saveList(arr, key) {
        localStorage.setItem(key, JSON.stringify(arr));
    }

    // создаем список дел
    function createTodoApp(conteiner, title = 'Список дел', key, defArr) {
        let todoAppTitle = createAppTitle(title);
        let todoItemForm = createTodoItemForm();
        let todoList = createTodoList();

        keyList = key;

        // проверяем на пустоту данные их локального хранилища и сохраняем их в массиве объектов
        let localData = localStorage.getItem(keyList);
        if (localData !== null && localData !== '') {
            listArray = JSON.parse(localData);
        } else {
            // добавляем в список дел дела по умолчанию
            listArray = defArr;
            // и сохраняем их в локальном хранилище
            saveList(listArray, keyList);
        }
        
        // предварительно создаем список дел на основе данных из локального хранилища
        for (const item of listArray) {
            let todoItem = createTodoItem(item);
            todoList.append(todoItem.item);
        }

        conteiner.append(todoAppTitle);
        conteiner.append(todoItemForm.form);
        conteiner.append(todoList);

        // браузер создает событие submit на форме по нажатию на Enter или на кнопку создания дела
        todoItemForm.form.addEventListener('submit', function (e) {
            // эта строчка необходима, чтобы предотвратить стандартное действие браузера
            // в данном случае мы не хотим, чтобы страница перезагружалась при отправке формы
            e.preventDefault();

            // игнорируем создание элемента, если пользователь ничего не ввел в поле
            if (!todoItemForm.input.value) {
                return;
            }            

            // создаем массив объектов из списка сохраняемых дел
            let newTodo = {
                id: getNewID(listArray),
                name: todoItemForm.input.value,
                done: false,
            };

            let todoItem = createTodoItem(newTodo);

            listArray.push(newTodo);

            console.log(listArray);

            // создаем и добавляем в список новое дело с названием из поля ввода
            todoList.append(todoItem.item);

            // сохраняем список дел при отправке данных из формы
            saveList(listArray, keyList);

            // блокируем кнопку после отправки данных из формы
            todoItemForm.button.disabled = true;

            // обнуляем значение в поле, чтобы не пришлось стирать его вручную
            todoItemForm.input.value = '';
        });
    }

    window.createTodoApp = createTodoApp;
})();