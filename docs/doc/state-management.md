
# ELM
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

# VUE
- At parent element, use `v-bind:items="todoList"` to pass in data. `items` is attribute on child scope, `todoList` is key on parent scope.
- At child component, define `v-on:click="$emit('enlarge-text', 0.1)"`.
- At parent component, define `v-on:enlarge-text="postFontSize += $event"`.
  - Or if `v-on:enlarge-text="onEnlargeText"`, 0.1 will be 1st param of callback `onEnlargeText`.

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

## An example for calculator

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

