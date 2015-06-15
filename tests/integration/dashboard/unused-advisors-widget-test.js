import Ember from 'ember';
import { test } from 'ember-qunit';
import '../../helpers/define-fixture';
import testHelper from '../../test-helper';

const unusedAdvisor = {
  advisorName: 'Johnny Advisor',
  projectName: 'Project Name',
  termsSentAt: '2015-02-18T10:00:00.000+00:00'
};

QUnit.module("Unused Advisors Widget", {
  beforeEach: function() {
    testHelper.beforeEach.apply(this, arguments);

    Timecop.install();
    Timecop.freeze(moment('2015-02-18T10:30:00.000+00:00'));

    defineFixture('GET', '/unused_advisors', { response: {
      "unused_advisors": [
        {
          "id": 1,
          "name": unusedAdvisor.advisorName,
          "terms_sent_at": unusedAdvisor.termsSentAt,
          "project_id": 32522,
          "advisor_id": 10
        }
      ],

      "projects": [
        {
          "id": 32522,
          "name": unusedAdvisor.projectName,
          "codename": "Internal Project title"
        }
      ],

      "advisors": [
        {
          "id": 10,
          "avatar_url": 'http://avatar-url.com',
          "name": unusedAdvisor.advisorName,
          "time_zone": null,
          "emails": [],
          "job_title": 'Boss',
          "company_name": 'Life, Inc.',
          "phone_numbers": [],
          "phones": []
        }
      ]
    }});
  },

  afterEach: function() {
    testHelper.afterEach.apply(this, arguments);
    Timecop.uninstall();
  }
});


test("Show unused advisors list", function(assert) {
  visit('/dashboard');

  andThen(function() {
    var $unusedAdvisor = find('.unused-advisors article:first');

    var unusedAdvisorListItem = {
      advisorName: $unusedAdvisor.find('.title span').text().trim(),
      projectName: $unusedAdvisor.find('.title small').text().trim(),
      termsSentAt: $unusedAdvisor.find('.time span').text().trim()
    };

    assert.deepEqual(unusedAdvisorListItem, {
      advisorName: unusedAdvisor.advisorName,
      projectName: unusedAdvisor.projectName,
      termsSentAt: 'Terms sent 30 minutes ago'
    });

    assert.equal(find('.unused-advisors article').length, 1);
  });
});

test("Remove unused advisor from list", function(assert) {
  visit('/dashboard');

  andThen(function() {
    assert.equal(find('.unused-advisors article').length, 1);
  });

  let oldConfirm = window.confirm;
  window.confirm = function() { return true; };
  defineFixture('DELETE', '/unused_advisors/1');
  click('.unused-advisors article:first .remove');

  andThen(function() {
    assert.equal(find('.unused-advisors article').length, 0);

    var message = $('.messenger .messenger-message-inner').first().text().trim();
    assert.equal(message, `The advisor ${unusedAdvisor.advisorName} was removed from the list.`);

    window.confirm = oldConfirm;
  });
});

test("Unused advisors widget team view", function(assert) {
  const team = {
    id: 1
  };

  const andrewRath = {
    id: 1,
    name: "Andrew Rath",
    unusedAdvisorsCount: 5
  };

  const taylorBrown = {
    id: 2,
    name: "Taylor Brown",
    unusedAdvisorsCount: 8
  };

  defineFixture('GET', '/interactions', { params: { team_id: team.id.toString()}, response: {
    "advisors": [],
    "client_contacts": [],
    "client_accounts": [],
    "projects": [],
    "interactions": [],
    "checklist_items": []
  }});


  defineFixture('GET', '/users/me', { response: {
    "user": {
      "id": andrewRath.id,
      "name": andrewRath.name,
      "time_zone": "America/New_York",
      "initials": andrewRath.initials,
      "team_id": team.id
    }
  }});

  defineFixture('GET', '/teams', { response: {
    "teams": [
      {
        "name": "NYSC13 - McKin' It Rain ",
        "id": team.id,
        "office": "New York"
      }
    ]
  }});

  defineFixture('GET', '/users', { params: { team_id: team.id.toString()}, response: {
    "users": [
      {
        "id": andrewRath.id,
        "avatar_url": "https://s3.amazonaws.com/assets_development.alphasights.com/avatars/6565139/thumb.jpeg?1381437797",
        "name": "Andrew Rath",
        "time_zone": "America/New_York",
        "initials": "ARR",
        "team_id": team.id,
        "developer": false
      },
      {
        "id": taylorBrown.id,
        "avatar_url": "https://s3.amazonaws.com/assets_development.alphasights.com/avatars/6565296/thumb.jpg?1390906879",
        "name": taylorBrown.name,
        "time_zone": "America/New_York",
        "initials": "TBB",
        "team_id": team.id,
        "developer":false
      }
    ]
  }});

  defineFixture('GET', '/delivery_performances', { params: { team_id: team.id.toString()}, response: {
    "delivery_performances": [
      {
        "id": 1,
        "user_id": andrewRath.id,
        "current_month_credit_count": 0,
        "monthly_target": 30,
        "unused_advisors_count": andrewRath.unusedAdvisorsCount
      },
      {
        "id": 2,
        "user_id": taylorBrown.id,
        "current_month_credit_count": 0,
        "monthly_target": 30,
        "unused_advisors_count": taylorBrown.unusedAdvisorsCount
      },
    ]
  }});

  visit(`/dashboard?team_id=${team.id}`);

  andThen(function() {
    var teamUnusedAdvisors = find('.team-unused-advisors article').toArray().map(function(unusedAdvisorInfo) {
      var $unusedAdvisorInfo = $(unusedAdvisorInfo);

      return {
        analystName: $unusedAdvisorInfo.find('.analyst span').text().trim(),
        unusedAdvisorsCount: $unusedAdvisorInfo.find('.stats span').text().trim()
      };
    });

    assert.deepEqual(teamUnusedAdvisors, [{
      analystName: taylorBrown.name,
      unusedAdvisorsCount: `${taylorBrown.unusedAdvisorsCount} Unused Advisors`
    },{
      analystName: andrewRath.name,
      unusedAdvisorsCount: `${andrewRath.unusedAdvisorsCount} Unused Advisors`
    }]);
  });
});