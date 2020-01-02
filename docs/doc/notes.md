# ELM
- Type definition
  - Model: model schema, for example { uid: Int, counters: CounterType }
  - Msg: coulde be Token, could be pattern like 'Modify Int Counter.Msg }

- Update (Actions)
  - Update view model based on different message (Action name)

- View
  - HTML in fp way
  - Defines binding 'HTML Event => Message'

- Init
  - init model

- Other functions
  - Other functions are defined at the top level too, used in this component
    - It can be used at anywhere since ELM is fp
  - High Order function is the key concept for abstraction.
    - updateCounter : Int -> Counter.Msg -> IndexedCounter -> IndexedCounter

- Browser.sandbox { init = init, update = update, view = view }

- Looks it prefers immuntable

## Parent Child Communication
- Child component still send the same message when HTML Event happens
- Parent component will capture the message, map it to new message if needed
- Update in parent component, will process the message and re-distrubute to child component by calling child.update explicitly if needed

## What is the problem for ELM
- When I use a sub component, why do I need to rebind its state machine at parent? I would rather treat it as a black box.
- When I have to hack in to sub component, I would rather to re-write one - with maximum possible reusability on former one.
- When sub component needs to talk with parent, send a message with data up is fine, but what to sent should be decided by sub component

# VUE
- At parent element, use `v-bind:items="todoList"` to pass in data. `items` is attribute on child scope, `todoList` is key on parent scope.
- At child component, define `v-on:click="$emit('enlarge-text', 0.1)"`.
- At parent component, define `v-on:enlarge-text="postFontSize += $event"`.
  - Or if `v-on:enlarge-text="onEnlargeText"`, 0.1 will be 1st param of callback `onEnlargeText`.

# vuex
vuex is a copycat of redux and elm, but match with VUE element life cycle.

# React
- React follows view = f(model).
- You can modify whatever place of model you want, and simply call render. All update relys on virtual DOM.
- React has trick like shouldComponentUpdate to save the preformance

# Design
- 'Action' is the connection for `View => Model`
  - When view event triggered, a 'message' as action name will be send to component
  - Message can be processed by current model, by actionDef defined under the `actionName`.
  - Message can be processed by direct parent model, by actionDef defined under `childId.actionName`.
- `Model => View` is simple reactive update without user knowing it
- No talking between different component, no global event bus

## State = Model + Action

```code
                  +-----------+
       +--->      |           |      Action
 State            |   Model   +-------------------+
       +--->      |           |                   |
                  +-----------+                   |
                        ^                         |
                        |                         |
                        |                         |
                        |                         |
                        |                         v
                        |                   +-----------+
       +--->            |                   |           |
 State                  +-------------------+   Model   |
       +--->                   Action       |           |
                                            +-----------+
```
* flux/redux is trying to use a global store, as 'state template', when given value is assigned to the 'store', it becomes an actual 'state instance' which will define the UI.
* Action will update the value in 'state template' so that it becomes 'another state instance'.
* From academy point of view, 2 different 'state instance' may belongs to the same 'state'; But for engineering purpose, 'state instance' can help for modular and testability here.
* From reusibility point of view, small state from sub component will compose to a singleton state.

# An example for calculator

Given viewModel:
```
class Calculator
{
    prop Value : string = "0" {const}

    func Digit(i: int): void;
    func Dot(): void;
    func Add(): void;
    func Mul(): void;
    func Equal(): void;
    func Clear(): void;
}
```

A real state machine description:
```
class Calculator
{
    var valueFirst : string = "";
    var op : string = "";
    prop Value : string = "0";

    func Update(value : string) : void
    {
        SetValue(value);
        valueFirst = value;
    }

    func Calculate() : void
    {
        if (valueFirst == "")
        {
            valueFirst = value;
        }
        else if (op == "+")
        {
            Update((cast double valueFirst) + (cast double Value));
        }
        else if (op == "*")
        {
            Update((cast double valueFirst) * (cast double Value));
        }
        else
        {
            raise $"Unrecognized operator: $(op)";
        }
    }

    $state_machine
    {
        $state_input Digit(i : int);
        $state_input Dot();
        $state_input Add();
        $state_input Mul();
        $state_input Equal();
        $state_input Clear();

        $state Digits()
        {
            $switch(pass)
            {
                case Digit(i)
                {
                    Value = Value & i;
                    $goto_state Digits();
                }
            }
        }

        $state Integer(newNumber: bool)
        {
            $switch(pass)
            {
                case Digit(i)
                {
                    if (newNumber)
                    {
                        Value = i;
                    }
                    else
                    {
                        Value = Value & i;
                    }
                    $goto_state Digits();
                }
            }
        }

        $state Number()
        {
            $push_state Integer(true);
            $switch(pass_and_return)
            {
                case Dot()
                {
                    Value = Value & ".";
                }
            }
            $push_state Integer(false);
        }

        $state Calculate()
        {
            $push_state Number();
            $switch
            {
                case Add():     {Calculate(); op = "+";}
                case Mul():     {Calculate(); op = "-";}
                case Equal():   {Calculate(); op = "=";}
                case Clear():
                {
                    valueFirst = "";
                    op = "";
                    Value = "0";
                }
            }
            $goto_state Calculate();
        }

        $state
        {
            $goto_state Calculate();
        }
    }
}
```

I don't think we really care about the state in this granularity - it is adding the complexity in unecessary way



# 20191207
## Component
   - Component is a holder of model + template + action
   - Not all 3 pieces are required
   - Do we need a global component like redux practice?

## Template ( View )
   - Event on view will pipe to action/message only
   - Some secret contracts are required between DOM Event and action input

## Action
   - Action is the atom component for state change
   - All 'message' needs to process in the same level component
   - If pass to parent is required, need to define an explicit action
   - Action itself dosen't trigger the view update but the post assignment to model does.

## Model
   - Allow local definition as constant
   - Model can be defined outside by model attribute
   - Allow init action to load data in sync/async
     - Can be a performance improvement point here
   - Cross model update should not be supported since it is hard to trace

## Import
   - Top-level import can import another component
   - They will be put under scope by component name - you can reuse them in your context by `view: ${view1.view}`

# View
## Description
- React follows `view=f(state)`. If ignore aciton for a while we can also say `view=f(model)`.
- Here `view` is not the actual view but the `f`.

## Some Design Principle
- General principle
  - Minimize the place needs to update
  - For the place really needs to update/replace DOM, use vDOM
- For the part which may has model changes:
  - Approach 1: blindly eval(in vDOM) and run compare
    - vFunc = f
    - vNode = f(m);
    - patch( oldNode, vNode )
    In this approach the f(m) and global compare will be unnecessary overhead
  - Approach 2:
    - Build f with semantic structure ( f-each, f-when, normal, custom? )
      - renderer = f-each( expr, template );
        - vNode = renderer(m);
        - patch( oldNode, vNode )
      - renderer = f-when( cond, template );
        - vNode = renderer(m);
        - patch( oldNode, vNode )
      - custom decorator(for example highlight) can modify the dom too on top of template. No way to predict what will be modified, run patch will be safe option
      - renderer = f-when( true, template );
        - vNode = vNormal(m);
        - patch( oldNode, vNode )


## Notes
- vDOM is just an abstraction of DOM with
  - DOM like interface
  - patch method on actual DOM
  We can still do the f smartly on top of vDOM for performance


# Scratch
## Goal
* Performance
* Easy to define and change
* Easy to debug

## Concept
* As usability, we need an easy standard practice to satisfy 80% use case.
* Behind that there should be a LL engine to support that 'easy standard'; also can help on rest 20% if needed.
* Pass-by-value design ( not really pass-by-value ) will make the design much cleaner
* View related Syntax should be in View Template, View Model related syntax should be in view model definition

## FP
* FP has its credit here, easy to compose, stateless ( as DSL )
* FP is hard to performance tuning
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
