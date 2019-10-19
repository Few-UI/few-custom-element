# Lifecycle for few-view element
## Current flow (20191018)
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

## Propoal
Considering case below:
```html
<!--mainView-->
<f-view src="frame">
    <f-view slot="slot1" src="view1"></f-view>
    <div slot="slot2">
        <f-view src="view2"></f-view>
    <div>
    <!--unnamed slot-->
    <f-view src="view3"></f-view>
</f-view>
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
    - React on 'src' and render the view. ( async )
    - setup the context here. <-- if we set it up before, it will impact slot element intialization
    - **backup slots after 1st async call so that slot subview gets time to init whatever it is**
      - it should not impact parsing performance since anything in slot is managed/parsed by mainView already

- processing subView
  - constructor
    - basic declaration
  - attributeChangedCallback
    - same as above
  - setup the context correctly.
  - react on 'src' and render the view (async)
