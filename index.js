
const getGlia = () => {
  return sm.getApi({version: 'v1'});
}

const setInfoValue = (elementId, value) => {
  const element = document.getElementById(elementId);
  element.innerText = value;
};

const copyOnClick = elementId => {
  const element = document.getElementById(elementId);
  element.addEventListener('click', () => {
    navigator.clipboard.writeText(element.innerText);
  });
};

const onUpdateInformation = customAttributesUpdateMethod => {
  const customAttributes = JSON.parse(document.getElementById('updateInformation').value);
  getGlia().then(glia => {
    glia.updateInformation({customAttributes, customAttributesUpdateMethod});
  });
};

const boot = () => {
  copyOnClick('siteId');
  copyOnClick('visitorId');
  copyOnClick('engagementId');
  copyOnClick('visitorCode');

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
window.history.replaceState({}, document.title, '/');

window.navigateToFlashFm = () => {
  const flashFmUrl = 'https://flashfm.tumblr.com';
  const href = externalSessionId ? `${flashFmUrl}?external_session_id=${externalSessionId}` : flashFmUrl;
  window.location.href = href;
}

window.getGliaContext = () => {
  return {
    sessionId: externalSessionId
  };
};

window.addEventListener('load', boot);
