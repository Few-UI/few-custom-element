# Introduction
This repo is majorly for practice purpose and try to achieve:
- Writing a MVVM system from scratch
- Low code practice with low cost setup
- As thin as possible
- Performance

# How to Use
- Get the `docs/few.js`.
- Simply include it in HTML:
```html
    <script data-main="few.js" src="require.min.js"></script>
```
- Then you can start build your component. Refer to this site as example.

# Supported Features
- [x] Action Flow
- [x] Data binding
- [ ] Custom Attribute as Unit
- [x] Custom Attribute as Directive
- [x] Slot without Shadow DOM
- [x] Condition and Loop in HTML Template
- [x] Ignore function while use it with other framework
- [ ] Model Initialization
- [ ] Virtual DOM
- [ ] Reactive Update
- [ ] Generic virtualization


# Acknowledgement
- This homework is inspired by:
  - [ELM](https://elm-lang.org/)
    - [UNIDIRECTIONAL USER INTERFACE ARCHITECTURES](https://staltz.com/unidirectional-user-interface-architectures.html)
  - [Vue](https://vuejs.org/v2/guide/)
    - Some features like condition and loop are getting input from Vue Doc
  - [snabbdom](https://github.com/snabbdom/snabbdom)
    - A decent virtual DOM lib in 200 SLOC
  - [Milligram CSS Framework](https://milligram.io)
    - The CSS framework is used by this DEMO site
