const items_div = document.getElementById('items_div');
const title_input = document.getElementById('title');
const url_input = document.getElementById('url');
var edit_mode = false;

window.onload = function() {
    if(localStorage.getItem('default_bookmarkets') == null) 
    {
        const url = 'data/default.json';
        load_json_from_file(url, (data) => {
            let items = get_items();
            items = [...items, ...data];
            set_items(items);
            render_items(items_div);
            localStorage.setItem('default_bookmarkets', '');
        });
    }

    render_items(items_div);

    document.getElementById('append_item').addEventListener('click', () => {
        const title = title_input.value;
        const input_url = url_input.value;
        if (title && url) {
            const url = input_url.replace(/^(?!https?:\/\/)/, 'https://');
            const item = {
                title,
                url
            };
            append_item(item);
            render_items(items_div);

            title_input.value = '';
            url_input.value = '';
        }
    });

    document.addEventListener('keydown', (event) => {
        if(document.activeElement.matches('input')){return;}

        if(event.shiftKey)
        {
            switch(event.code)
            {
                case 'KeyD':
                    edit_mode = !edit_mode;
                    render_items(items_div);
                    break;
                case 'KeyS':
                    let function_form = document.getElementById('function_form');
                    function_form.hidden = !function_form.hidden;
                    break;
                case 'KeyL':
                    let url = prompt('press config url','');
                    if(url){
                        let url_reg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/
                        if(url_reg.test(url)){
                            load_json_from_file(url, (data) => {
                                set_items(data);
                                render_items(items_div);
                            });
                        }
                    }
                    break;
                case 'KeyC':
                    if(event.altKey && event.shiftKey && event.ctrlKey){
                        if(confirm('sure clear all?')){
                            clear_items();
                            render_items(items_div);
                            localStorage.removeItem('default_bookmarkets');
                        }
                    }
                    break;
                default: break;
            }
        }
    });
};


function append_item(item) {
    const items = get_items();
    items.push(item);
    set_items(items);
}

function delete_item(index) {
    const items = get_items();
    items.splice(index, 1);
    set_items(items);
}

function get_items() {
    var items = JSON.parse(localStorage.getItem('bookmarkets') || '[]') || [];
    if(!Array.isArray(items)){ return []; }
    return items;
}

function set_items(items) {
    localStorage.setItem('bookmarkets', JSON.stringify(items));
}

function clear_items() {
    localStorage.removeItem('bookmarkets');
}

function render_items(items_container) {
    const items = get_items();
    items_container.innerHTML = '';
    items.forEach((item, index) => {
        const item_box = document.createElement('div');
        item_box.setAttribute('class', 'item_box');
        item_box.innerHTML = `<a href="${item.url}" target="_blank" rel="nofollow">${item.title}</a><div class="delete_item_div" hidden><div class="delete_item_btn">x</div></div>`;

        items_container.appendChild(item_box);
    });

    document.querySelectorAll('.delete_item_btn').forEach((item, index) => {
        item.addEventListener('click', () => {
            delete_item(index);
            render_items(items_div);
        });
    });

    document.querySelectorAll('.delete_item_div').forEach((item, index) => {
        item.hidden = !edit_mode;
    });
}

function load_json_from_file(url, process_func) {
    fetch(url)
        .then(response => response.json())
        .then(data => { process_func(data); })
        .catch(error => { console.error('Failed to load items from remote:', error); })
}
