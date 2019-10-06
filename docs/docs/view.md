# Description
- React follows `view=f(state)`. If ignore aciton for a while we can also say `view=f(model)`.
- Here `view` is not the actual view but the `f`.

# Some Design Principle
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
    - Build f with semantic structure ( v-for, v-if, normal, custom? )
      - renderer = v-for( expr, template );
        - vNode = renderer(m);
        - patch( oldNode, vNode )
      - renderer = v-if( cond, template );
        - vNode = renderer(m);
        - patch( oldNode, vNode )
      - custom decorator(for example highlight) can modify the dom too on top of template. No way to predict what will be modified, run patch will be safe option
      - renderer = v-if( true, template );
        - vNode = vNormal(m);
        - patch( oldNode, vNode )


# Notes
- vDOM is just an abstraction of DOM with
  - DOM like interface
  - patch method on actual DOM
  We can still do the f smartly on top of vDOM for performance
