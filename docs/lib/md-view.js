
/* eslint-env es6 */

define( [ 'few', 'https://cdn.jsdelivr.net/npm/marked/marked.min.js' ], ( few, marked ) => {
    class SampleButton extends HTMLElement {
        static get tag() {
            return 'md-view';
        }

        get clickAction() {
            return this.getAttribute( 'click' );
        }

        constructor() {
            super();

            const shadowRoot = this.shadowRoot || this.attachShadow( { mode: 'open' } );

            // Apply style to shadow DOM
            // let style = document.createElement( 'style' );
            // style.textContent = buttonCss;
            // shadowRoot.appendChild( style );
            const style = document.createElement( 'style' );
            style.textContent = `
        body {
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
            font-size: 16px;
            line-height: 1.5;
            word-wrap: break-word;
            background: #F9F9F9;
        }

        #container {
            max-width: 900px;
            margin: auto;
        }

        #content {
            padding: 5px 10px;
            border: 1px solid #ddd;
            border-radius: 3px;
            background: white;
        }

        #content h1:first-child {
            margin-top: 0px;
        }

        nav {
            border: 1px solid #ddd;
            border-radius: 3px;
            background: white;
            margin-right: 10px;
        }

        nav > ul {
            position: sticky;
            top: 5px;
            margin: 10px 0px;
            padding: 0;
            list-style-type: none;
            font-size: 14px;
        }

        nav > ul > li {
            min-width: 125px;
            padding: 0px 15px;
        }

        nav > ul > li > ul {
            padding-left: 25px;
        }

        nav > ul > li > ul > li {
            font-size: 0.8em;
        }

        nav .selected {
            color: #111;
            font-weight: bold;
        }

        nav .selected:hover {
            text-decoration: none;
        }

        header {
            display: flex;
            height: 50px;
        }

        header h1 { margin: 0; }

        table {
            border-spacing: 0;
            border-collapse: collapse;
            border: 1px solid #ddd;
        }

        td, th {
            border: 1px solid #ddd;
            padding: 5px;
        }

        a {
            color: #0366d6;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        pre {
            font-family: "SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 3px;
        }

        code:not([class]) {
            font-family: "SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;
            padding: 0.2em 0.4em;
            margin: 0;
            /*font-size: 85%;
            background-color: rgba(27,31,35,0.05);*/
            border-radius: 3px;
        }
            `;

            let contentDOM = document.createElement( 'div' );
            shadowRoot.appendChild( style );
            shadowRoot.appendChild( contentDOM );

            let src = this.getAttribute( 'src' );

            few.httpGet( src ).then( ( content ) => {
                contentDOM.innerHTML = marked( content );
            } );


            /*
            let newDom = document.createElement( 'div' );
            newDom.innerHTML = '<button class="base-button" ><slot/></button>';
            shadowRoot.appendChild( newDom.firstChild );
            */
        }

        /*
        Cannot do it here - need to load context from parent
        attributeChangedCallback( name, oldValue, newValue ) {
            console.log( `${name}: ${oldValue} => ${newValue}` );
        }
        */
    }
    customElements.define( SampleButton.tag, SampleButton );
} );
