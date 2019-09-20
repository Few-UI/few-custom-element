# Notes

## Web Component
* The constructor for a custom element is not supposed to read or write its DOM. It shouldn't create child elements, or modify attributes. That work needs to be done later, usually in a connectedCallback() method ([Reference](https://stackoverflow.com/questions/43836886/failed-to-construct-customelement-error-when-javascript-file-is-placed-in-head))

* connectedCallback in Chrome does not guarantee children are parsed. ([Reference](https://stackoverflow.com/questions/48498581/textcontent-empty-in-connectedcallback-of-a-custom-htmlelement))

* attribute and property are not parsed too in constructor, it will be done by no early than `connectedCallback()`.

## Procedure Graph
```
                          +---------------------+
                          | Button Click (View) +<-------------+
                          +----------+----------+              |
                                     |                         |
                                     |                         |
                                     |                         |
                                     v                         |
     +-----------+        +----------+----------+        +-----+-----+
     |           |   In   |                     |  Out   |           |
     |           +------->+      Procedure      +------->+           |
     |           |        |                     |        |           |
     |           |        +----------+----------+        |           |
     |           |                   |                   |           |
     | ViewModel |                   |                   | ViewModel |
     |           |                   |                   | (Updated) |
     |           |                   v                   |           |
     |           |        +----------+----------+        |           |
     |           |   In   |                     |  Out   |           |
     |           +------->+      Procedure      +------->+           |
     |           |        |                     |        |           |
     +-----------+        +---------------------+        +-----------+

```

# References
[Google Example](https://developers.google.com/web/fundamentals/web-components/examples/howto-tabs)
