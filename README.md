Evan
====

*Custom events*

Evan implements a general eventing system in which any object that can be represented by a path (typically in a hierarchical, tree-like structure like to the DOM) may trigger and capture events.

Evan is based on [Troop](https://github.com/production-minds/troop) for OOP and [Sntls](https://github.com/danstocker/sntls) .

Features
--------

- Subscription and unsubscription
- Event bubbling
- Delegation (capturing closer to the root than the actually observed node)
- Broadcasting (triggering many subscribed paths at once)
- Evented behavior to be assigned to classes and instances. Most of the event management will be done though this, as the tutorial below shows.

Tutorial
--------

The following [example](http://jsfiddle.net/danstocker/Hw8Ya/
) creates an evented class, endows it and its instances with evented properties, then triggers an event on the instance. Right below it's presented in its entirety, followed by a step by step explanation.

```javascript
var eventSpace = evan.EventSpace.create(),
    MyClass = troop.Base.extend()
        .addTrait(evan.Evented)
        .initEvented(eventSpace, 'test>path'.toPath())
        .addMethod({
            init: function (path) {
                this.initEvented(eventSpace, path);
            }
        })
        .on('myEvent', function (event) {
            console.log("event triggered", event.clone());
        });

var myInstance = MyClass.create('test>path>foo'.toPath());

myInstance.triggerSync('myEvent');
```

**Step by step**

First, we created an event space for the class. Events will traverse within the confines of this space. Events cannot cross between spaces.

```javascript
var eventSpace = evan.EventSpace.create(),
```

Then, we created a new class ...

```javascript
MyClass = troop.Base.extend()
```

... and added the evented behavior as a Troop trait.

```javascript
.addTrait(evan.Evented)
```

Then, we assign the event space and a path that represents the whole class.

```javascript
.initEvented(eventSpace, 'test>path'.toPath())
```

Then added an `init` method, which takes an individual path specific to the instance and applies it to it.

```javascript
this.initEvented(eventSpace, path);
```

Building the class is concluded by adding an event handler that is supposed to capture all 'myEvent' events that concern this class. The handler logs the event to the console. (The event is cloned because when an event has finished traversing the event space it will reset.)

```javascript
.on('myEvent', function (event) {
    console.log("event triggered", event.clone());
});
```

Now, to try how this works on an instance, we need to instantiate the class.

```javascript
var myInstance = MyClass.create('test>path>foo'.toPath());
```

Finally, we trigger an event on the instance.

```javascript
myInstance.triggerSync('myEvent');
```

This will trigger the event handler we applied to it statically on the class, but within the handler, while `event.currentPath.asArray` will say `['test','path']`, `event.originalPath.asArray` will say `['test','path','foo']`, as implied by the path we assigned to the instance.
