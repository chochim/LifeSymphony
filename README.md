# Life Symphony


![Life Symphony](images/lifesymphony.jpg)

Life Symphony is a project that helps visualizing real-time birth and deaths happening around the world. In addition to visualization, the user can interact with these events by adding musical instruments, notes, etc. This enables the user to create _music_.The project makes use of [d3](https://d3js.org/), [midijs](http://www.midijs.net/), [pre-rendered midi soundfonts](https://github.com/gleitz/midi-js-soundfonts).

The website is hosted as Github page here: [https://chochim.github.io/LifeSymphony/](https://chochim.github.io/LifeSymphony/).


##Generation of real-time events

The events like birth and death are generated using the [CIA World Factbook](https://www.cia.gov/library/publications/the-world-factbook/rankorder/2054rank.html). These statistics combined with the current population data provides the average frequency of the occurence of birth and death for a particular country. 

##Music generation

Currently, the user has the option of choosing six instruments viz. flute, acoustic piano, xylophone, sitar, drums, and violin. In case you need to add more instruments, download the [pre-rendered midi soundfonts](https://github.com/gleitz/midi-js-soundfonts) and put it in the appropriate location.


##Code

The main action takes place in the _map.js_ file.
