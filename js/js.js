const items_div = document.getElementById('link_list');

var edit_mode = false;

window.onload = function() {
    if(localStorage.getItem('default_bookmarkets') == null) 
    {
        const url = 'data/default.json';
        load_json_from_url(url, (items) => {
            append_items(items);
            render_items(items_div);
            localStorage.setItem('default_bookmarkets', '');
        });
    }

    render_items(items_div);

    document.getElementById('accept_edit_btn').addEventListener('click', () => {
        const name_input = document.getElementById('link_name');
        const url_input = document.getElementById('link_url');
        const name = name_input.value;
        const input_url = url_input.value;
        if (name && url) {
            const url = input_url.replace(/^(?!https?:\/\/)/, 'https://');
            const item = {
                name: name,
                url: url
            };
            append_item(item);
            render_items(items_div);

            name_input.value = '';
            url_input.value = '';

            set_edit_page_visible(false);
        }
    });

    document.getElementById('reject_edit_btn').addEventListener('click', () => {
        set_edit_page_visible(false);
    });

    document.getElementById('link_url').addEventListener('keydown',  (event) => {
        if(event.code === 'Enter' || event.code === 'NumpadEnter' ){
            document.getElementById('accept_edit_btn').click();
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if(event.code === 'Escape'){
            set_edit_page_visible(false);
        }

        if(document.activeElement.matches('input')){return;}

        if(event.shiftKey)
        {
            switch(event.code)
            {
                case 'KeyD':
                    edit_mode = !edit_mode;
                    update_edit_mode();
                    break;
                case 'KeyE':
                    if(confirm('sure export?')){
                        let time = new Date();
                        let str_file_name = time.valueOf() + '.json';
                        export_json_file(get_items(), str_file_name);
                    }
                    break;
                case 'KeyS':
                    set_edit_page_visible(true);
                    break;
                case 'KeyL':{
                    let url = window.prompt('press config url','');
                    if(url){
                        let url_reg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/
                        if(url_reg.test(url)){
                            load_json_from_url(url, (data) => {
                                set_items(data);
                                render_items(items_div);
                            });
                        }
                    }
                }
                    break;
                case 'KeyI':{
                    let dom = document.createElement('input');
                    dom.type = 'file';
                    dom.accept = 'application/JSON'
                    dom.onchange = function () {
                        if(this.value === '' || this.files.length < 1) {
                            return false;
                        }
                    
                        let selected_file = this.files[0];
                        load_json_from_local_file(selected_file, (items) => {
                            append_items(items);
                            render_items(items_div);
                        });
                    };
                    dom.click();
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

function append_items(items) {
    if(!Array.isArray(items)){ return; }

    const pre_items = get_items();
    items = [...pre_items, ...items];
    set_items(items);
}

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
    if(items_container === undefined || items_container === null ){return;}

    const groups = [{
        name: "common",
        link_list: get_items()
     }];
    
    items_container.innerHTML = '';
    groups.forEach((group, index) => {
        const link_list_group = document.createElement('div');
        link_list_group.setAttribute('class', 'link_list_group');

        const link_list_data = group["link_list"];
        link_list_data.forEach((link_data, index) => {
            const link_box = document.createElement('div');
            link_box.setAttribute('class', 'link_card');
            link_box.innerHTML = `<a href="${link_data.url}" target="_blank" rel="nofollow">${link_data.name}</a><div class="link_card_delete"></div>`;
    
            link_list_group.appendChild(link_box);
        });

        items_container.appendChild(link_list_group);
    });

    document.querySelectorAll('.link_card_delete').forEach((item, index) => {
        item.addEventListener('click', () => {
            delete_item(index);
            render_items(items_div);
        });
    });

    update_edit_mode();
    set_edit_page_visible(false);
}

function set_edit_page_visible(show) {
    let box = document.getElementById('edit_page');
    box.hidden = !show;
}

function update_edit_mode(){
    document.querySelectorAll('.link_card_delete').forEach((item, index) => {
        item.hidden = !edit_mode;
    });
}

function export_json_file(data, file_name) {
    let content = JSON.stringify(data);
    if(content.length == 0){return;}

    let dom_a = document.createElement('a');
    dom_a.download = file_name;
    dom_a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    dom_a.click();
}

function load_json_from_local_file(file, process_func) {
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = function() {
        var items = JSON.parse(this.result) || [];
        process_func(items);
    };
    reader.onerror = function() { console.log(reader.error); };
}

function load_json_from_url(url, process_func) {
    fetch(url)
        .then(response => response.json())
        .then(data => { process_func(data); })
        .catch(error => { console.error('Failed to load items from remote:', error); })
}
