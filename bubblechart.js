/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Visualization from 'zeppelin-vis';
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector';
import Bubble from './bubble';

/**
 * Base class for visualization
 */
export default class bubblechart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)
    this.targetEl.append('<svg></svg>');

    this.columnselectorProps = [
      {
        name: 'name'
      },
      {
        name: 'value'
      },
      {
        name: 'group'
      },
      {
        name: 'color'
      }
    ];
    
    this.columnselector = new ColumnselectorTransformation(config, this.columnselectorProps);
  }

  render(tabledata) {
    var height = this.targetEl.height();
    var width = this.targetEl.width();
    console.log('bubble chart data', tabledata)
    console.log('bubble chart config', this.config);
    var colIdx = [];
    
    for (var idx in tabledata.columns) {
      var col = tabledata.columns[idx];
      if (this.config.name && col.name == this.config.name.name) {
        colIdx[0] = idx;
      }
      if (this.config.value && col.name == this.config.value.name) {
        colIdx[1] = idx;
      }
      if (this.config.group && col.name == this.config.group.name) {
        colIdx[2] = idx;
      }
      if (this.config.color && col.name == this.config.color.name) {
        colIdx[3] = idx;
      }
    }

    var bubbledata = [];
    for (var rIdx in tabledata.rows) {
      var row = tabledata.rows[rIdx];
      var bubbleRow = [];
      for (var idx in colIdx) {
        bubbleRow[idx] = row[colIdx[idx]];
      }
      bubbledata.push(bubbleRow);
    }

    if (!angular.equals(bubbledata, this.bubbledata)) {
      this.bubble = undefined;
    }
    
    this.bubbledata = bubbledata;

    if (!this.bubble) {
      this.bubble = new Bubble(
        bubbledata,
        {
          width:width,
          height: height,
          gravity:0.12,
          damper: 0.1,
          friction: 0.9,
          col: 3
        }
      );
      this.bubble.display(this.targetEl);
    }
    
    if (this.config.mode == 'group') {
      this.bubble.group();
    } else {
      this.bubble.all();
    }
  }

  
  
  getTransformation() {
    return this.columnselector;
  }

  getSetting(chart) {
    var self = this;
    var configObj = self.config;

    return {
      template: `<div class="btn-group">
        <button type="button"
                class="btn btn-default"
                ng-click="all()"
                ng-class="{'active': !config.mode || config.mode == 'all'}">All</button>
        <button type="button"
                class="btn btn-default"
                ng-click="group()"
                ng-class="{'active': config.mode == 'group'}">Group</button>
      </div>`,
      scope: {
        config: configObj,
        all: function() {
          configObj.mode = 'all';
          self.emitConfig(configObj);
        },
        group: function() {
          configObj.mode = 'group';
          self.emitConfig(configObj);
        }
      }
    };
  }
}
