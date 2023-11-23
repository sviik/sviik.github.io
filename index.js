
const setInfoValue = (elementId, value) => {
  const element = document.getElementById(elementId);
  element.innerText = value;
};

const copyElementTextOnClick = elementId => {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('click', () => {
      navigator.clipboard.writeText(element.innerText);
    });
  }
};

const copyOnClick = (elementId, getValue) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('click', () => {
      navigator.clipboard.writeText(getValue());
    });
  }
};

const onUpdateInformation = customAttributesUpdateMethod => {
  const information = JSON.parse(document.getElementById('updateInformation').value);
  sm.getApi({version: 'v1'}).then(glia => {
    glia.updateInformation({...information, customAttributesUpdateMethod});
  });
};

const defaultVisitorInformation = `{
  "name": "new name",
  "phone": "+155555555",
  "email": "example@example.com",
  "note": "new note",
  "customAttributes": {
    "key": "value"
  }
}`;

const boot = () => {
  copyElementTextOnClick('siteId');
  copyElementTextOnClick('visitorId');
  copyElementTextOnClick('engagementId');
  copyElementTextOnClick('operatorId');
  copyElementTextOnClick('visitorCode');
  copyOnClick('accessToken', () => sm.accessToken)
  document.getElementById('updateInformation').value = defaultVisitorInformation;


  sm.getApi({version: 'v1'}).then(glia => {
    setInfoValue('siteId', glia.getSiteId());
    setInfoValue('visitorId', glia.getVisitorId());

    const onEngagementStart = engagement => {
      setInfoValue('engagementId', engagement.engagementId);
      setInfoValue('operatorId', engagement.operator.id);
    };

    const onEngagementEnd = engagement => {
      setInfoValue('engagementId', '');
      setInfoValue('operatorId', '');
    };

    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, onEngagementStart);
    glia.addEventListener(glia.EVENTS.ENGAGEMENT_END, onEngagementEnd);

    glia.omnibrowse.getVisitorCode().then(visitorCodeResponse => {
      const element = document.getElementById('visitorCode');
      element.innerText = visitorCodeResponse.code;
    });

    glia.getQueues().then(queues => {
      const queuesEl = document.getElementById('queues');
      queues.forEach(queue => {
        const id = queue.id;
        const name = queue.name;
        const status = queue.state.status;

        const queueEl = document.createElement('li');
        queueEl.innerText = `${name} - ${status}`;
        queueEl.addEventListener('click', _event => {
          glia.queueForEngagement('text', {queueId: id});
        });

        queuesEl.append(queueEl);
      });
    });
  });
};

const externalSessionId = (new URLSearchParams(window.location.search)).get('external_session_id');

window.getGliaContext = () => {
  return {
    sessionId: externalSessionId
  };
};

window.addEventListener('load', boot);
