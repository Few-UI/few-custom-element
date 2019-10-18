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

### Lifecycle for few-view element
#### Current flow (20191018)
- Construct component
  - Load `component.yml`. (async, critical)
  - New and Initialize component object.
- Construct view
  - Load view HTML dependency. (async, not critical)
  - Parse view to unit. (we don't need to make this depend on view HTML dep maybe)
- Resolve slot in view if there it is.
- Attach to page
  - Set the scope to DOM (compoenent accesibility in DOM)
  - Attach to page element
  - render current view ( typically and update )

#### Propoal
Considering case below:
```html
<!--mainView-->
<few-view src="frame">
    <few-view slot="slot1" src="view1"></few-view>
    <div slot="slot2">
        <few-view src="view2"></few-view>
    <div>
    <!--unnamed slot-->
    <few-view src="view3"></few-view>
</few-view>
```

Basically, the slot case, we need to achieve:
- The sub view needs to bind with mainView, not frame.
- Try to be generic, follow the Custom Element contract, no hacky design.
- Consider shadowDOM and non-shadowDOM case.
- No heavy design in few-view, so that when other users can easily build their own.

The loading flow will be:
- processing mainView
  - Interpret mainView, do whatever we want
  - attach main view to dom and custom element process for mainView content start to work.

- processing frameView
  - From now all custom element call back is synchronized
    - constructor
    - attributeChangedCallback
    - connectedCallback
    So before any async process start, if we can pass the context donwn that will be great
  - constructor
    - basic declaration
  - attributeChangedCallback
    - If it has been connected, react on attribute change
      - not supporting variation at 'model' attribute for now
    - Otherwise wait for connect call back
  - connectedCallback
    - setup the context correctly. For synchronized follow up
    - React on 'src' and render the view. ( async )
    - backup slots after 1st async call so that slot subview gets time to init whatever it is
      - it should not impact parsing performance since anything in slot is managed/parsed by mainView already

- processing subView
  - constructor
    - basic declaration
  - attributeChangedCallback
    - same as above
  - setup the context correctly.
  - react on 'src' and render the view (async)

- processing
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
