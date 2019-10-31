# How ELM define a component
- Type definition
  - Model -> Model type only
  - Message (Action name)
    - Message is a special function, that f => update(msg)
      - But in ELM it could be array too, it is a mapping pattern

- Update (Actions)
  - React based on different message (Action name)

- View
  - HTML in fp way
  - Defines binding 'HTML Event => Message'

- Init
  - init model

- Other functions
  - Other functions defines at top level too, which will be used in this component
    - It can be used at anywhere since ELM is fp
    - OOTB Def above is nothing but function in name which occupied by system

## Parent Child Communication
- Child component still send the same message when HTML Event happens
- Parent component will capture the message, map it to new message if needed
- Update in parent component, will process the message and re-distrubute to child component by calling child.update explicitly if needed

## What is the problem for ELM
- When I use a sub component, why do I need to rebind its state machine at parent? I would rather treat it as a black box.
- When I have to hack in to sub component, I would rather to re-write one - with maximum possible reusability on former one.
- When sub component needs to talk with parent, send a message with data up is fine, but what to sent should be decided by sub component

# How Vue define component interaction
- At parent element, use `v-bind:items="todoList"` to pass in data. `items` is attribute on child scope, `todoList` is key on parent scope.
- At child component, define `v-on:click="$emit('enlarge-text', 0.1)"`.
- At parent component, define `v-on:enlarge-text="postFontSize += $event"`.
  - Or if `v-on:enlarge-text="onEnlargeText"`, 0.1 will be 1st param of callback `onEnlargeText`.

