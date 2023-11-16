
const getGlia = () => {
  return sm.getApi({version: 'v1'});
}

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
  getGlia().then(glia => {
    glia.updateInformation({...information, customAttributesUpdateMethod});
  });
};

const boot = () => {
  copyElementTextOnClick('siteId');
  copyElementTextOnClick('visitorId');
  copyElementTextOnClick('engagementId');
  copyElementTextOnClick('visitorCode');
  copyOnClick('accessToken', () => sm.accessToken)

  getGlia().then(glia => {
    setInfoValue('siteId', glia.getSiteId());
    setInfoValue('visitorId', glia.getVisitorId());

    const onEngagementStart = engagement => {
      setInfoValue('engagementId', engagement.engagementId);
    };

    const onEngagementEnd = engagement => {
      setInfoValue('engagementId', '');
    };

    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, onEngagementStart);
    glia.addEventListener(glia.EVENTS.ENGAGEMENT_END, onEngagementEnd);

    glia.omnibrowse.getVisitorCode().then(visitorCodeResponse => {
      const element = document.getElementById('visitorCode');
      element.innerText = visitorCodeResponse.code;
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
