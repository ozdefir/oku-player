# Oku Player
Cross-browser timedtext player for creating 'Read along' books

## Description

This project is a personal attempt to explore new ways of reading by the use of synchronized audio.

Although there are already a multitude of *Read along*/*Read aloud* applications, in most of them the user interface is more distracting than engaging (e.g. Amazon's *Immersion Reading*). **Oku Player**, on the other hand, aims to offer an intuitive and non-intrusive interface that let's the user decide how much to intervene and when to switch between reading, listening and reading and listening.

Differences from similar applications include:
* Instead of the usual reflowable text it features a hybrid of paged view and scrollable text. That is, the user sees a paged view unless he/she scrolls. Scrolling behaviour is the same as in any web page and the transition from paged view is seamless.
* A nuisance with similar applications is the partial fragments at the end of the pages. This leads to a poor user experience. In contrast, Oku Player's paged view leaves the half-fragments for the next page.

## Usage

In order to function, Oku Player needs the paths for three resources:  
+ __Audio file(s)__ which must be in a format that is supported by your target browser(s)
+ __A syncmap file__ in json format that has the timestamps for each fragment, see aeneas docs.
+ __An XHTML file__ in which the text is split into fragment elements that are marked by the class name "fragm".

The paths to those files should be included in a configuration object, optionally with additional settings and metadata:
~~~~
....
	var okuConfig = {
		"xhtmlPath":"29s.xhtml",
		"syncmapPath":"29s.json",
		"audioPaths":["29.mp3","29.ogg"],
		"meta":{
			"book":"The Adventures of Tom Sawyer",
			"author":"Mark Twain",
			"chapter":"Chapter 29",
			"chapterAuthor":"",
			"info":"Read by Piotr Nater for LibriVox",
			"toc":"/the-adventures-of-tom-sawyer-by-mark-twain",
			"fullscreen":"/play/the-adventures-of-tom-sawyer-dramatic-reading-by-mark-twain/chapter-29"
		},
		"settings":{
			"continuous":true,
			"autoscroll":true,
			"pagedView":true
		}
	};

var okuPlayerInstance = new OkuPlayer(okuConfig);
....
~~~~

In addition it is possible to add event listeners for timedtext load, fragment end, page end and timedtext end:	
~~~~
okuPlayerInstance.on("pageended", "pageturnEffect");
~~~~

Visit [https://archive.org/details/@timedtexts](https://archive.org/details/@timedtexts) to see working examples.

## Limitations
+ Because of the same-origin policy the XHTML and JSON files should be hosted on the same domain as the timedtext player unless the target host allows CORS.
+ Some browsers such as Google Chrome do not allow XHR for local files.
