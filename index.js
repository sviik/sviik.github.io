

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

const boot = () => {
  copyOnClick('siteId');
  copyOnClick('visitorId');
  copyOnClick('engagementId');

  sm.getApi({version: 'v1'}).then(glia => {
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
  });
};

window.addEventListener('load', boot);
