import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appHXXoVD1tn9QATh');

import Header from './header';
import Footer from './footer';

function reducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  const [activities, setActivities] = useState([]);

  const [clients, dispatch] = React.useReducer(
    reducer,
    [] // initial clients
  );

  // When app first mounts, fetch clients
  useEffect(() => {

    base('Clients').select().eachPage((records, fetchNextPage) => {
      dispatch(records);

      fetchNextPage();
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

  }, []); // Pass empty array to only run once on mount

  function uploadChallenge(client) {
    const employerName = client.fields['Limeade e='];

    const startDate = '6/11/2020';
    const endDate = '6/15/2020';
    const imageUrl = 'https://images.limeade.com/PDW/ac93a008-e318-49b9-9eba-93a83d5edfcd-large.jpg';
    const title = 'System Maintenance';
    const activityText = 'do the activity in the description';
    const shortDescription = 'Starting 6/13/2020 12:00 am PST and continuing through the weekend, we will be performing system maintenance on some of our online services.';
    const longDescription = '<p>It is possible that you may experience interruptions when trying to access some of our services. Please feel free to reach out to support if you have any issues.</p>';

    const data = {
      'AboutChallenge': longDescription,
      'ActivityReward': {
        'Type': 'IncentivePoints',
        'Value': '0'
      },
      'ActivityType': activityText,
      'AmountUnit': '',
      'ButtonText': 'CLOSE',
      'ChallengeLogoThumbURL': imageUrl,
      'ChallengeLogoURL': imageUrl,
      'ChallengeTarget': 1,
      'ChallengeType': 'OneTimeEvent',
      'Dimensions': [],
      'DisplayInProgram': startDate === moment().format('YYYY-MM-DD') ? true : false,  // sets true if the challenge starts today
      'DisplayPriority': 100,
      'EndDate': endDate,
      'EventCode': '',
      'Frequency': 'None',
      'IsDeviceEnabled': false,
      'IsFeatured': null,
      'IsSelfReportEnabled': false,
      'IsTeamChallenge': false,
      'Name': title,
      'PartnerId': 1,
      'ShortDescription': shortDescription,
      'ShowExtendedDescription': true,
      'ShowWeeklyCalendar': false,
      'StartDate': startDate,
      'TargetUrl': '/Home?sametab=true',
      'TeamSize': null
    };

    $.ajax({
      url: 'https://api.limeade.com/api/admin/activity',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      headers: {
        Authorization: 'Bearer ' + client.fields['LimeadeAccessToken']
      },
      contentType: 'application/json; charset=utf-8'
    }).done((result) => {

      // Change row to green on success (and remove red if present)
      $('#' + employerName.replace(/\s*/g, '')).removeClass('bg-danger');
      $('#' + employerName.replace(/\s*/g, '')).addClass('bg-success text-white');
      $('#' + employerName.replace(/\s*/g, '') + ' .challenge-id').html(`<a href="${client.fields['Domain']}/admin/program-designer/activities/activity/${result.Data.ChallengeId}" target="_blank">${result.Data.ChallengeId}</a>`);

    }).fail((request, status, error) => {
      $('#' + employerName.replace(/\s*/g, '')).addClass('bg-danger text-white');
      console.error(request.status);
      console.error(request.responseText);
      console.log('Create challenge failed for client', client.fields['Limeade e=']);
    });

  }

  function renderClients() {
    const sortedClients = [...clients];

    sortedClients.sort((a, b) => {
      const nameA = a.fields['Account Name'].toLowerCase();
      const nameB = b.fields['Account Name'].toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return sortedClients.map((client) => {
      const employerName = client.fields['Limeade e='];

      return (
        <tr id={employerName.replace(/\s*/g, '')} key={employerName}>
          <td>
            <a href={client.fields['Domain'] + '/ControlPanel/RoleAdmin/ViewChallenges.aspx?type=employer'} target="_blank">{client.fields['Account Name']}</a>
          </td>
          <td className="challenge-id"></td>
          <td>
            <button type="button" className="btn btn-primary" onClick={() => uploadChallenge(client)}>Upload</button>
          </td>
        </tr>
      );
    });

  }

  return (
    <div id="app">
      <Header />

      <table className="table table-hover table-striped" id="activities">
        <thead>
          <tr>
            <th scope="col">Account Name</th>
            <th scope="col">Challenge Id</th>
            <th scope="col">Upload</th>
          </tr>
        </thead>
        <tbody>
          {renderClients()}
        </tbody>
      </table>

      <Footer />

    </div>
  );
}

export default App;
