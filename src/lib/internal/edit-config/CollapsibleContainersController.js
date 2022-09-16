import EventManager from '../../../helpers/EventManager'
import * as EventEmitter from 'events'


export default class CollapsibleContainersController {
  constructor (document) {
    this._document = document
    this._event_manager = new EventManager()
    this._$ = document.querySelector.bind(document)
    this._$a = document.querySelectorAll.bind(document)
  }
  init () {
    this._event_manager.addDOMListenerFor(this._document, 'click', (evt) => {
      let elm = evt.target
      let parent_check_len = 4
      while (elm && elm.nodeType == 1 && --parent_check_len > 0) {
        let toggle_sel = elm.getAttribute('data-collapse-toggle')
        if(toggle_sel) {
          let toggle_elm = document.querySelector(toggle_sel)
          if(toggle_elm) {
            evt.preventDefault()
            this.toggleCollapsible(toggle_elm)
          }
        }
        elm = elm.parentNode
      }
    }, false)
    this._event_manager.addDOMListenerFor(window, 'resize', this.setNeedsUpdate.bind(this), false)
    this.updateAll()
  }
  destroy () {
    this._event_manager.removeAllListeners()
  }
  setNeedsUpdate () {
    if(this._update_timeoutid) {
      clearTimeout(this._update_timeoutid)
    }
    this._update_timeoutid = setTimeout(() => {
      delete this._update_timeoutid
      this.updateAll()
    }, 200)
  }
  updateAll () {
    for (let elm of this._$a('.x-collapsible')) {
      if (!elm.classList.contains('x-collapse')) {
        this.updateCollapsible(elm)
      }
    }
  }
  updateCollapsible (elm) {
    if (elm._collapsible_timeout3 != null) {
      clearTimeout(elm._collapsible_timeout3)
      elm._collapsible_timeout3 = null
    }
    let tmp = elm
    let set_height_queue = []
    while (tmp != null && tmp.nodeType == document.ELEMENT_NODE) {
      if (tmp.classList.contains('x-collapsible')) {
        set_height_queue.push(this._updateCollapsibleSubrout(tmp))
      }
      tmp = tmp.parentNode
    }
    for (let set_height of set_height_queue) {
      set_height()
    }
    if (set_height_queue.length > 0) {
      elm._collapsible_timeout3 = setTimeout(() => {
        elm.dispatchEvent(new CustomEvent('x-collapsible-move-end', { bubbles: true }))
        elm._collapsible_timeout3 = null
      }, 500)
    }
  }
  _updateCollapsibleSubrout (elm) {
    if(elm._collapsible_timeout != null) {
      clearTimeout(elm._collapsible_timeout)
    }
    let pre_height = elm.offsetHeight
    elm.style.height = ''
    let height = elm.offsetHeight
    return () => {
      elm.style.height = pre_height + 'px'
      if(height != pre_height) {
        elm._collapsible_timeout = setTimeout(function() {
          elm.style.height = height + 'px'
          delete elm._collapsible_timeout
        }, 10)
      }
    }
  }
  toggleCollapsible (toggle_el, toggle) {
    let contains_collapse = toggle_el.classList.contains('x-collapse');
    toggle = toggle == null ? contains_collapse : toggle
    if(toggle_el._collapsible_timeout != null) {
      clearTimeout(toggle_el._collapsible_timeout)
    }
    if (toggle_el._collapsible_timeout2 != null) {
      clearTimeout(toggle_el._collapsible_timeout2)
    }
    if (toggle && contains_collapse) {
      toggle_el.classList.remove('x-collapse')
      this.updateCollapsible(toggle_el)
      toggle_el._collapsible_timeout2 = setTimeout(() => {
        delete toggle_el._collapsible_timeout2
        // add inline style overflow: visible
        toggle_el.style.overflow = 'visible'
      }, 500)
    } else if (!toggle && !contains_collapse) {
      toggle_el.style.display = 'none'
      if(toggle_el.parentNode) {
        this.updateCollapsible(toggle_el.parentNode)
      }
      toggle_el.style.display = ''
      toggle_el._collapsible_timeout = setTimeout(() => {
        // remove inline style overflow
        toggle_el.style.overflow = ''
        toggle_el.classList.add('x-collapse')
        delete toggle_el._collapsible_timeout
      }, 10)
    }
  }
}
