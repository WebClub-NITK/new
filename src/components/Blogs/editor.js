import React from 'react'
import ReactQuill from 'react-quill';
import '../../styles/editor.css'
import "../../styles/blog.css";
import Nav from "../Nav/Nav";
// import { data } from 'jquery';
import BlogApi from "../../_services/blogApi";
import urlApi from "../../_services/urlApi";
import queryString from 'query-string';
import {Redirect} from 'react-router-dom'
import mynoty from './../../components/mynoty'

class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.publishButton = React.createRef();
        this.state = {
            editorHtml: '',
            theme: 'snow',
            blgoId: -1 ,//to check weather we are writing new blog or editing new blog.
            redirectStatus:0,
            header:'new-blog'
        }
        this.handleChange = this.handleChange.bind(this)
        this.postBlog = this.postBlog.bind(this)
    }

    handleChange(html) {
        this.setState({ editorHtml: html }); //quill function to update editor html
    }
    alertUser = e => {
        console.log(e);
        e.preventDefault()
        e.returnValue = ''
    }
    
    async componentDidMount() {
        
        let id = await queryString.parse(this.props.location.search).id;
        console.log(id)
        if (id !== undefined) {  //if we are on edit blog page below code to fill the text editor
            // console.log(id+"blogid")
            this.setState({
                blgoId: id
            })
            mynoty.show("Loading your blog in the editor", 1)
            let res = await BlogApi.loadBlogWithId(id)
            // console.log()
            let tags = res.tag_list;
            let tag_list = []
            for (let i = 0; i < tags.length; i++) {
                tag_list.push(`#${tags[i]}`)
            }
            let data = `<h1>${res.heading}</h1><p>${res.sample_text}</p><p>${res.content}</p><p>${tag_list}</p>`;

            this.setState({
                editorHtml: data
            })
            // console.log(res)
        }

    }
    async postBlog() {
        let data_to_send = this.state.editorHtml
        // console.log(data_to_send)
        this.publishButton.current.style.display = 'none' //hiding publish button
        let res = await BlogApi.postBlog(urlApi.backendDomain() + '/addblog', data_to_send, this.state.blgoId);
        // console.log(res)
        if (res === undefined) {
            this.publishButton.current.style.display = 'block'; //unhide publish button if failed to publish blog
        }else{
            console.log(res);
            this.setState({
                blgoId:res.id,
                heading:res.heading,
                redirectStatus:true
            })
        }
    }

    render() {
        
        return (
            <>
                <Nav sticky="true" transp="false" />
                {this.state.redirectStatus===true && <Redirect to={`/blog/${this.state.heading}?id=${this.state.blgoId}`}/>}
                <ReactQuill className="text_editor"
                    theme={this.state.theme}
                    onChange={this.handleChange}
                    value={this.state.editorHtml}
                    modules={Editor.modules}
                    formats={Editor.formats}
                    bounds={'.app'}
                    placeholder={'Type here...'}
                />
                <div style={{ background: 'white' }} className="p-2">
                    <div style={{ maxWidth: '800px' }} className="mx-auto"  >
                        <button className="my-btn border-0" ref={this.publishButton} onClick={this.postBlog} >Publish</button>
                    </div>
                </div>
            </>
        )
    }
}

/* 
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */

Editor.modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' },
        { 'indent': '-1' }, { 'indent': '+1' }, { 'color': ['#000000', 'red', 'green', 'blue', 'pink', 'lightgrey', 'Tomato', 'MediumSeaGreen', 'Violet', 'SlateBlue'] }],
        ['link', 'image'],
        [{
            handlers: {
                'color': function (value) {
                    if (value === 'custom-color') value = window.prompt('Enter Hex Color Code');
                    this.quill.format('color', value);
                }
            }
        }]
    ],
    clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
    }
}
/* 
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'color',
    'link', 'image'
]

/* 
 * PropType validation
 */
//   Editor.propTypes = {
//     placeholder: PropTypes.string,
//   }
export default Editor