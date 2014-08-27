# GLO (Graph-Level Operations)
by Charles D. Stolper, Minsuk (Brian) Kahng, Zhiyuan (Jerry) Lin, Florian Foerster, Aakash Goel, John Stasko, and Duen Horng (Polo) Chau

## What is GLO?



## Software Requirements

* You only need a modern web browser, such as Google Chrome or Firefox.
 

## How to run the prototype

### To run with Chrome:
* Using command line:

    python -m SimpleHTTPServer 8000 
    (8000 will be your port number. You can use any.)

* Open Chrome:

    http://localhost:8000/gui.html

### To run with Firefox:
* Just open the file gui.html with Firefox.



## How to apply your graph data
* creating a directory in the directory data/
* place two csv files into the directory you just created
* 
    nodes.csv: modularity_class
    edges.csv: source, target,
    
* Replace the line 14 of the file js/les_mis_demo.js by 

    var source = “YOUR_DIRECTORY_NAME”


## Notes
* Since all the computations are performed in client-side, we recommend to use graphs up to 1000 nodes.
* It only supports pre-defined attributes. Our current prototype does not automatically detect attributes from data.


## Publications
* GLO-STIX: Graph-Level Operations for Specifying Techniques and Interactive eXploration by Charles D. Stolper, Minsuk (Brian) Kahng, Zhiyuan (Jerry) Lin, Florian Foerster, Aakash Goel, John Stasko, and Duen Horng (Polo) Chau. IEEE Transactions on Visualization and Computer Graphics, 2014.
* GLOs: Graph-Level Operations for Exploratory Network Visualization by Charles D. Stolper, Florian Foerster, Minsuk Kahng, Zhiyuan Lin, Aakash Goel, John Stasko, and Duen Horng (Polo) Chau. 
In Proceedings of the 32nd ACM SIGCHI Conference on Human Factors in Computing Systems (CHI 2014 Extended Abstracts), pp. 1375-1380. ACM, 2014.
