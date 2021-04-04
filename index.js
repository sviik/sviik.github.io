
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

window.addEventListener('load', boot);
