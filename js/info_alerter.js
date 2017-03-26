import EventEmitter from '../core/events';
import dom from '../core/dom';
import * as u from 'utility';


export default class InfoAlerter extends EventEmitter {

  constructor() {
    super();
    this.listenTo(window, 'message');

    this.alerts = {};
    this.alertTimers = {};
   
    let container = dom.create('<div class=alert-container></div>');

    dom.body().append(container);

    this.dom = dom(container);
  }


  remove() {
    this.stopListening();
    this.dom.remove();
  }


  message(e) {
    if (e.data.event === 'alert')
      this.showAlert(e.data.args);
  }


  showAlert({
    head = '',
    body = '',
    pre = '',
    type = 'info',
    id = Math.random(),
    timeout = 2000
  }) {

    if (!['error','info'].includes(type))
      throw 'Invalid alert type';

    if (head)
      head = `<h2>${ u.escape(head) }</h2>`;

    if (body)
      body = u.escape(body).split('\n').map(d => `<div>${d}</div>`).join('');
    
    if (pre)
      pre = `<pre>${ u.escape(pre) }</pre>`;

    let el = dom.create(`<div class="alert ${type}">${head}${body}${pre}</div>`);

    let removeAlert = () => {
      dom(el).addClass('hidden').on('animationend', () => {
        el.remove()
        this.alerts[id] = null;
      });
    }

    dom(el).on('click', () => removeAlert())

    // replace existing
    if (this.alerts[id])
      this.alerts[id].remove();

    if (this.alertTimers[id])
      clearTimeout(this.alertTimers[id]);

    this.alerts[id] = el;

    this.dom.append(el);

    if (timeout)
      this.alertTimers[id] = setTimeout(() => removeAlert(), timeout)
    else
      clearTimeout(this.alertTimers[id])

    return el;
  }

};


