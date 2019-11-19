# Notes

## Web Component
* The constructor for a custom element is not supposed to read or write its DOM. It shouldn't create child elements, or modify attributes. That work needs to be done later, usually in a connectedCallback() method ([Reference](https://stackoverflow.com/questions/43836886/failed-to-construct-customelement-error-when-javascript-file-is-placed-in-head))

* connectedCallback in Chrome does not guarantee children are parsed. ([Reference](https://stackoverflow.com/questions/48498581/textcontent-empty-in-connectedcallback-of-a-custom-htmlelement))

* attribute and property are not parsed too in constructor, it will be done by no early than `connectedCallback()`.

## Design Note
### How is ELM
- ELM concept:
  - Model
  - View
  - Update
    - Msg

- Each concept is a composition from sub view.
- update in Sub view will not be called automatically, update from parent view needs to decide when an how
- When Msg raised from sub view, you can use App.map to map it to Msg, which can be consumed by parent
  - Better to reserve childMsg so that u can use it when u call child's update

### Question
#### Shall we bubble up all Msg in sub component to parent?
No, we should treat sub component as black box. It doesn't has flexibility like ELM, but it is codeless
#### How to share data between components?
- A global stack
- Call Stack
- Maybe we still need a message map?


# References
- [Rules for Custom Element](https://stackoverflow.com/questions/55215397/js-custom-element-get-inner-html)
- [Web Component Example fro Google - Tabs](https://developers.google.com/web/fundamentals/web-components/examples/howto-tabs)
- [Unidirectional User Interface Architectures](https://staltz.com/unidirectional-user-interface-architectures.html)
- [ShieldsIO(for badge)](https://shields.io/category/build)
- [VDOM](https://github.com/livoras/blog/issues/13)
- [MV*](https://github.com/livoras/blog/issues/11)
- [snabbdom](https://github.com/creeperyang/blog/tree/master/codes/snabbdom)
- [coroutine state machine](https://zhuanlan.zhihu.com/p/31001684)
