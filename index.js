
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
  },
  "externalId": "abc123"
}`;

const boot = () => {
  document.getElementById('updateInformation').value = defaultVisitorInformation;
};

const externalSessionId = (new URLSearchParams(window.location.search)).get('external_session_id');

window.getGliaContext = () => {
  return {
    sessionId: externalSessionId
  };
};

window.addEventListener('load', boot);
