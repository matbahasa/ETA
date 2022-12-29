# ETA: Easy Text Annotator
ETA is a web-based text annotation tool that is easy to use even for those who are not adept in computers.  It allows simple text annotation involving a single feature with one or more than one value.  Three types of outputs are supported: raw annotation, summary and html.

## Installation
Download the zip file from this page and unzip it.  For uninstallation, simply delete the relevant folder.

## Basic usage
- You need two files:
    1. Text/corpus (text file)
    2. Annotation (tab-separated text file)
        - To start a completely new annotation, you can use `annotation_template.txt` with necessary customization.  You need to change the FILE NAME, FEATURE\_NAME, and the number and name(s) of the VALUE(s) in accordance with your task.
        - Alternatively, you can also use a file exported from a more sophisticated tool.  In fact, `annotation_template.txt` adopts the format of [UAM Corpus Tool](http://www.corpustool.com).

1. Open `Easy Text Annotator.html`.
2. Drag and drop the two files above onto the main window.
3. Select the range you wish to annotate.  Then, click on the "+" button at the bottom right corner.

**Note** As the number of annotation increases, the process may take longer to
- load the text/corpus file;
- display the annotation window;
- add/delete/modify an annotation; and
- generate a summary file.

## How to cite
Nomoto, Hiroki, Kaoru Kayukawa & Yuta Takayasu. 2022. _ETA: Easy Text Annotator_. GitHub repository. https://github.com/matbahasa/ETA
```bibtex
@misc{NomotoEtAlETA,
  author = {Nomoto, Hiroki and Kayukawa, Kaoru and Takayasu, Yuta},
  title = {ETA: Easy Text Annotator},
  year = {2022},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/matbahasa/ETA}}
}
```

## Acknowledgement
The development of ETA was supported by JSPS KAKENHI Grant Number JP20H01255 (A cross-linguistic study of pronoun substitutes and address terms; PI: Sunisa Wittayapanyanon).
